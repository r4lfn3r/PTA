export type BotRole = 'Watcher' | 'RiskManager' | 'Trader' | 'Orchestrator' | 'System';

export type SignalType = 'BUY' | 'SELL';

export interface MarketDataSignal {
    symbol: string;
    price: number;
    indicators: {
        vpin?: number;
        rsi?: number;
        macd?: number;
        [key: string]: number | undefined;
    };
    confidenceScore: number; // 0 to 100
}

/**
 * Propuestas de Trade (TradeProposal)
 * Generadas por el Bot Analista (Watcher) y evaluadas por el Bot de Riesgo.
 */
export interface TradeProposal {
    id: string; // Identificador único de la propuesta
    timestamp: Date; // Cuándo se generó
    symbol: string; // Par de trading (ej. BTCUSDT)
    type: SignalType; // Compra o Venta
    price: number; // Precio sugerido de entrada
    amount: number; // Cantidad sugerida (puede ser ajustada por el RiskManager)
    stopLoss?: number; // Nivel de Stop Loss sugerido
    takeProfit?: number; // Nivel de Take Profit sugerido
    signalData: MarketDataSignal; // Datos crudos que justifican la propuesta
    status: 'Pending' | 'Approved' | 'Rejected' | 'Executed'; // Estado actual en el ciclo de vida
    riskReasoning?: string; // Explicación del RiskManager si es rechazada o modificada
}

/**
 * Eventos de Bot (BotEvent)
 * Sirven para la comunicación inter-bot y para el Panel del Centro de Operaciones en tiempo real.
 */
export interface BotEvent {
    id: string;
    timestamp: Date;
    source: BotRole; // Qué bot emitió el evento
    target: BotRole | 'All'; // A qué bot va dirigido
    eventType: 'ProposalCreated' | 'ProposalEvaluated' | 'OrderExecuted' | 'SystemError' | 'StatusUpdate';
    payload: Record<string, unknown> | string | number | boolean | null; // Información relevante del evento (ej. la propuesta, el error, etc.)
    message: string; // Mensaje legible para la UI
}

/**
 * Historial de Operaciones (TradeHistory)
 * Registro de trades ejecutados y finalizados.
 */
export interface TradeHistory {
    id: string;
    proposalId: string; // Referencia a la propuesta original
    symbol: string;
    type: SignalType;
    entryPrice: number;
    exitPrice?: number;
    amount: number;
    realizedPnL?: number; // Ganancia o pérdida real al cerrar la posición
    fee: number; // Comisiones cobradas
    status: 'Open' | 'Closed';
    openTime: Date;
    closeTime?: Date;
}

/**
 * Historial de Transacciones (TransactionHistory)
 * Registro inmutable de depósitos, retiros u otros movimientos de capital en la cuenta.
 */
export interface TransactionHistory {
    id: string;
    timestamp: Date;
    type: 'Deposit' | 'Withdrawal' | 'Fee' | 'Adjustment';
    amount: number; // Positivo (ingreso) o negativo (egreso)
    asset: string; // Moneda o asset (ej. USDT)
    txHash?: string; // Hash en caso de transacción on-chain
    description: string;
}
