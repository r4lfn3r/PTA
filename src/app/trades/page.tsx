'use client';

import { useTradingStore } from '@/store/useTradingStore';
import { History, TrendingUp, TrendingDown } from 'lucide-react';

export default function TradesHistoryPage() {
    const trades = useTradingStore((state) => state.tradeHistory);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <header className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <History className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Historial de Operaciones</h1>
                    <p className="text-sm text-zinc-400">Posiciones abiertas y ejecutadas por el Trader Bot.</p>
                </div>
            </header>

            <div className="bg-[#121212] border border-zinc-800/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-900/50 border-b border-zinc-800/50 text-zinc-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Apertura</th>
                                <th className="px-6 py-4 font-medium">Par</th>
                                <th className="px-6 py-4 font-medium">Lado</th>
                                <th className="px-6 py-4 font-medium">Precio Entrada</th>
                                <th className="px-6 py-4 font-medium">Volumen</th>
                                <th className="px-6 py-4 font-medium">Estado</th>
                                <th className="px-6 py-4 font-medium text-right">PnL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {trades.map((t) => (
                                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 text-zinc-500">
                                        {new Date(t.openTime).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-mono font-medium text-zinc-300">
                                        {t.symbol}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-1.5 ${t.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {t.type === 'BUY' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            <span className="font-bold text-xs">{t.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-zinc-300">
                                        ${t.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-zinc-400">
                                        {t.amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                                            ${t.status === 'Open'
                                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
                                            {t.status === 'Open' ? 'Posición Abierta' : 'Cerrada'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono">
                                        {t.realizedPnL !== undefined ? (
                                            <span className={t.realizedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                                {t.realizedPnL >= 0 ? '+' : ''}{t.realizedPnL.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-500 border-b border-dashed border-zinc-600">Calculando...</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {trades.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                        No hay operaciones registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
