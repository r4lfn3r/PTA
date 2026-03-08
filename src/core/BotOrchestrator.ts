import { useTradingStore } from '@/store/useTradingStore';
import { IndicatorEngine } from './IndicatorEngine';
import { BinanceClient } from './BinanceClient';
import { MarketDataSignal, TradeProposal } from '@/types/trading';

/**
 * El Orchestrator es el "Centro Nervioso" del ecosistema de bots.
 * Se ejecuta en el cliente (como Singleton o dentro de un hook useEffect global).
 * Coordina la comunicación entre los submódulos.
 */
export class BotOrchestrator {
    private static instance: BotOrchestrator;

    private indicatorEngine: IndicatorEngine;
    private binanceClient: BinanceClient | null = null;
    private pollingInterval: NodeJS.Timeout | null = null;

    // Par de pruebas
    private targetSymbol = 'BTCUSDT';

    // Histórico para indicadores (ej. simular volumen)
    private volumeHistory: number[] = [];

    private constructor() {
        this.indicatorEngine = new IndicatorEngine();

        // Nos suscribimos a los cambios del estado global para reaccionar
        useTradingStore.subscribe(
            (state) => state.bots,
            (bots) => this.handleBotsStateChange(bots)
        );
    }

    public static getInstance(): BotOrchestrator {
        if (!BotOrchestrator.instance) {
            BotOrchestrator.instance = new BotOrchestrator();
        }
        return BotOrchestrator.instance;
    }

    /**
     * Inicializa las conexiones y dependencias.
     * En producción real, requeriría Api keys configurables por el usuario.
     */
    public initialize(apiKey: string, apiSecret: string, isTestnet: boolean) {
        this.binanceClient = new BinanceClient(apiKey, apiSecret, isTestnet);

        useTradingStore.getState().addBotEvent({
            id: crypto.randomUUID(),
            timestamp: new Date(),
            source: 'System',
            target: 'All',
            eventType: 'StatusUpdate',
            payload: { isTestnet, initialized: true },
            message: 'Orchestrator inicializado y conectado a Binance.'
        });
    }

    /**
     * Reacciona cuando el usuario activa o desactiva bots desde la UI.
     */
    private handleBotsStateChange(bots: any[]) {
        const isWatcherRunning = bots.find(b => b.id === 'Hunter')?.state === 'Running';
        const isTraderRunning = bots.find(b => b.id === 'Hard-Trader')?.state === 'Running';

        if (isWatcherRunning && !this.pollingInterval) {
            this.startWatcher();
        } else if (!isWatcherRunning && this.pollingInterval) {
            this.stopWatcher();
        }
    }

    /**
     * Inicia el ciclo de vigilancia (Watcher Bot Logic)
     */
    private startWatcher() {
        if (!this.binanceClient) {
            console.error("No se puede iniciar el Watcher sin configurar la API");
            return;
        }

        useTradingStore.getState().addBotEvent({
            id: crypto.randomUUID(),
            timestamp: new Date(),
            source: 'Watcher',
            target: 'System',
            eventType: 'StatusUpdate',
            payload: { status: 'Running' },
            message: 'Iniciando escaneo de mercado...'
        });

        // Polling loop (idealmente WebSocket en producción, polling para demo simple)
        this.pollingInterval = setInterval(async () => {
            await this.analyzeMarketTick();
        }, 5000); // Cada 5 segundos para demostración
    }

    private stopWatcher() {
        if (this.pollingInterval) clearInterval(this.pollingInterval);
        this.pollingInterval = null;
    }

    /**
     * Un tick de análisis del mercado
     */
    private async analyzeMarketTick() {
        if (!this.binanceClient) return;

        try {
            // 1. Obtener datos (Simulado usando Book para tener BID/ASK real)
            const orderBook = await this.binanceClient.getOrderBook(this.targetSymbol) as any;

            // Extraer solo precios y volumes para el engine
            const bids = orderBook.bids.map((b: any) => [parseFloat(b.price), parseFloat(b.quantity)]) as [number, number][];
            const asks = orderBook.asks.map((a: any) => [parseFloat(a.price), parseFloat(a.quantity)]) as [number, number][];

            // Sumar volumen de bids (simplificación)
            const currentVolume = bids.reduce((acc, curr) => acc + curr[1], 0);

            // Mantener historial de volumen (FIFO, max 20)
            this.volumeHistory.push(currentVolume);
            if (this.volumeHistory.length > 20) this.volumeHistory.shift();

            // 2. Calcular indicadores
            const imbalance = this.indicatorEngine.getOrderBookImbalance(bids, asks);
            // Z-Score basado en los últimos 20 ticks de la orden de libros
            const zScoreV = this.indicatorEngine.calculateZScore(currentVolume, this.volumeHistory);

            const currentPrice = bids.length > 0 ? bids[0][0] : 0; // Top Bid

            // 3. Evaluar condición de propuesta (Estrategia)
            // Si hay fuerte desbalance comprador y volumen inusual, Proponer COMPRA.
            if (imbalance > 0.4 && zScoreV > 1.5) {
                this.generateProposal('BUY', currentPrice, bids, asks, imbalance, zScoreV);
            } else if (imbalance < -0.4 && zScoreV > 1.5) {
                this.generateProposal('SELL', currentPrice, bids, asks, imbalance, zScoreV);
            }

        } catch (error: any) {
            // Reportar error al bus
            useTradingStore.getState().addBotEvent({
                id: crypto.randomUUID(),
                timestamp: new Date(),
                source: 'Watcher',
                target: 'System',
                eventType: 'SystemError',
                payload: { error: error.message },
                message: `Error analizando mercado: ${error.message}`
            });
        }
    }

    private generateProposal(type: 'BUY' | 'SELL', price: number, bids: [number, number][], asks: [number, number][], imbalance: number, zScore: number) {

        const signal: MarketDataSignal = {
            symbol: this.targetSymbol,
            price: price,
            indicators: {
                bookImbalance: imbalance,
                volumeZScore: zScore,
            },
            confidenceScore: Math.min(100, Math.abs(imbalance * 100) + Math.abs(zScore * 10)),
        };

        const proposal: TradeProposal = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            symbol: this.targetSymbol,
            type: type,
            price: price,
            amount: 0.001, // Cantidad base por defecto (el RiskManager la ajustará)
            signalData: signal,
            status: 'Pending'
        };

        // 1. Guardar propuesta en el store
        useTradingStore.getState().addProposal(proposal);

        // 2. Emitir evento del bot Analista (Watcher)
        useTradingStore.getState().addBotEvent({
            id: crypto.randomUUID(),
            timestamp: new Date(),
            source: 'Watcher',
            target: 'RiskManager',
            eventType: 'ProposalCreated',
            payload: proposal,
            message: `Propuesta de ${type} generada para ${this.targetSymbol} a $${price.toFixed(2)} (Imbalance: ${(imbalance * 100).toFixed(1)}%)`
        });

        // 3. Notificar al Risk Manager que hay trabajo que hacer
        this.triggerRiskManager(proposal);
    }

    /**
     * Delega la responsabilidad al "Bot de Riesgo"
     */
    private triggerRiskManager(proposal: TradeProposal) {
        // Obtenemos estado actual  
        const state = useTradingStore.getState();
        const rmBot = state.bots.find(b => b.id === 'Risk-Manager');

        // Si el gestor de riesgo está apagado, la propuesta muere aquí
        if (rmBot?.state !== 'Running') {
            useTradingStore.getState().addBotEvent({
                id: crypto.randomUUID(),
                timestamp: new Date(),
                source: 'RiskManager',
                target: 'Watcher',
                eventType: 'ProposalEvaluated',
                payload: { proposalId: proposal.id, reason: 'Bot Apagado' },
                message: `Propuesta ${proposal.id.substring(0, 4)}... ignorada. Risk Manager desactivado.`
            });
            // Rechazar Proposal
            useTradingStore.getState().updateProposalStatus(proposal.id, 'Rejected', 'Risk Manager desactivado');
            return;
        }

        // --- LÓGICA DE RIESGO: Aplicar Kelly / Filtros Simples ---
        const { balance } = state;
        const maxRisk = rmBot.config?.maxRiskPerTrade || 0.02; // Ej: 2%

        // Simulación: No operar si no hay saldo
        if (balance < proposal.price * proposal.amount) {
            useTradingStore.getState().updateProposalStatus(proposal.id, 'Rejected', 'Capital insuficiente');
            useTradingStore.getState().addBotEvent({
                id: crypto.randomUUID(),
                timestamp: new Date(),
                source: 'RiskManager',
                target: 'Trader',
                eventType: 'ProposalEvaluated',
                payload: { proposalId: proposal.id },
                message: `Propuesta Rechazada: Capital insuficiente.`
            });
            return;
        }

        // Si pasa, Aprobamos
        useTradingStore.getState().updateProposalStatus(proposal.id, 'Approved', 'Parámetros de riesgo válidos');
        useTradingStore.getState().addBotEvent({
            id: crypto.randomUUID(),
            timestamp: new Date(),
            source: 'RiskManager',
            target: 'Trader',
            eventType: 'ProposalEvaluated',
            payload: { proposalId: proposal.id },
            message: `Propuesta Aprobada. Enviando orden al Trader.`
        });

        // 4. Pasar al Bot Ejecutor
        this.triggerTrader(proposal);
    }

    /**
     * Delega la responsabilidad al "Bot Ejecutor"
     */
    private triggerTrader(proposal: TradeProposal) {
        const state = useTradingStore.getState();
        const traderBot = state.bots.find(b => b.id === 'Hard-Trader');

        if (traderBot?.state !== 'Running') {
            // Rechazar ejecución si el trader está apagado
            return;
        }

        // En un escenario real, aquí se llamaría a this.binanceClient.placeMarketBuyOrder

        // Simulación de Ejecución:
        const executionEventId = crypto.randomUUID();
        useTradingStore.getState().updateProposalStatus(proposal.id, 'Executed');

        useTradingStore.getState().addBotEvent({
            id: executionEventId,
            timestamp: new Date(),
            source: 'Trader',
            target: 'System',
            eventType: 'OrderExecuted',
            payload: { proposalId: proposal.id, executionPrice: proposal.price },
            message: `ORDEN EJECUTADA: ${proposal.type} ${proposal.amount} ${proposal.symbol} @ $${proposal.price}`
        });

        // Actualizar Trade History y Balance
        const totalCost = proposal.price * proposal.amount;
        // Restar balance si compramos, sumar si vendemos (simplificación para demo)
        const newBalance = state.balance - totalCost;
        useTradingStore.getState().setBalance(newBalance);

        // Añadir a Historial de Transacciones y Trades
        useTradingStore.getState().addTrade({
            id: crypto.randomUUID(),
            proposalId: proposal.id,
            symbol: proposal.symbol,
            type: proposal.type,
            entryPrice: proposal.price,
            amount: proposal.amount,
            fee: totalCost * 0.001, // 0.1% fee ficticio
            status: 'Open',
            openTime: new Date()
        });
    }
}
