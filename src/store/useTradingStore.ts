import { create } from 'zustand';
import { TradeProposal, BotEvent, TradeHistory, TransactionHistory } from '../types/trading'; export type BotType = 'Hunter' | 'Hard-Trader' | 'Risk-Manager';
export type BotState = 'Running' | 'Stopped' | 'Error';

export interface Bot {
    id: BotType;
    name: string;
    state: BotState;
    config: Record<string, any>;
}

export interface LogEntry {
    id: string;
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    source: 'System' | BotType;
}

interface TradingState {
    isSimulation: boolean;
    setSimulation: (val: boolean) => void;

    latency: number;
    setLatency: (val: number) => void;

    balance: number;
    setBalance: (val: number) => void;

    bots: Bot[];
    toggleBot: (id: BotType) => void;
    updateBotConfig: (id: BotType, config: Record<string, any>) => void;

    logs: LogEntry[];
    addLog: (message: string, type?: LogEntry['type'], source?: LogEntry['source']) => void;

    apiKeyConfigured: boolean;
    setApiKeyConfigured: (val: boolean) => void;

    // Nuevos estados para el ecosistema de bots:
    proposals: TradeProposal[];
    addProposal: (proposal: TradeProposal) => void;
    updateProposalStatus: (id: string, status: TradeProposal['status'], riskReasoning?: string) => void;

    botEvents: BotEvent[];
    addBotEvent: (event: BotEvent) => void;

    tradeHistory: TradeHistory[];
    addTrade: (trade: TradeHistory) => void;

    transactions: TransactionHistory[];
    addTransaction: (tx: TransactionHistory) => void;
}

export const useTradingStore = create<TradingState>((set, get) => ({
    isSimulation: true,
    setSimulation: (val) => set({ isSimulation: val }),

    latency: 0,
    setLatency: (val) => set({ latency: val }),

    balance: 10000,
    setBalance: (val) => set({ balance: val }),

    bots: [
        { id: 'Hunter', name: 'Hunter (Gemcoin Scanner)', state: 'Stopped', config: { zScoreThreshold: 2.0 } },
        { id: 'Hard-Trader', name: 'Hard-Trader (BTC/ETH)', state: 'Stopped', config: { orderFlowImbalance: 15 } },
        { id: 'Risk-Manager', name: 'Risk-Manager (Kelly/ATR)', state: 'Running', config: { maxRiskPerTrade: 0.02 } },
    ],

    toggleBot: (id) => set((state) => ({
        bots: state.bots.map(b =>
            b.id === id ? { ...b, state: b.state === 'Running' ? 'Stopped' : 'Running' } : b
        )
    })),

    updateBotConfig: (id, config) => set((state) => ({
        bots: state.bots.map(b =>
            b.id === id ? { ...b, config: { ...b.config, ...config } } : b
        )
    })),

    logs: [
        { id: 'init-1', timestamp: new Date(), message: 'System initialized in Sandbox mode', type: 'info', source: 'System' }
    ],
    addLog: (message, type = 'info', source = 'System') => set((state) => ({
        logs: [{
            id: Math.random().toString(36).substring(7),
            timestamp: new Date(),
            message,
            type,
            source
        }, ...state.logs].slice(0, 50) // Keep last 50 logs
    })),

    apiKeyConfigured: false,
    setApiKeyConfigured: (val) => set({ apiKeyConfigured: val }),

    proposals: [],
    addProposal: (proposal) => set((state) => ({
        proposals: [proposal, ...state.proposals]
    })),
    updateProposalStatus: (id, status, riskReasoning) => set((state) => ({
        proposals: state.proposals.map(p =>
            p.id === id ? { ...p, status, riskReasoning } : p
        )
    })),

    botEvents: [],
    addBotEvent: (event) => set((state) => ({
        botEvents: [event, ...state.botEvents].slice(0, 100) // Mantener últimos 100 eventos
    })),

    tradeHistory: [],
    addTrade: (trade) => set((state) => ({
        tradeHistory: [trade, ...state.tradeHistory]
    })),

    transactions: [],
    addTransaction: (tx) => set((state) => ({
        transactions: [tx, ...state.transactions]
    }))
}));
