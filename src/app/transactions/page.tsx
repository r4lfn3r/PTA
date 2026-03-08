'use client';

import { useTradingStore } from '@/store/useTradingStore';
import { ReceiptText, ArrowDownLeft, ArrowUpRight, Plus, Minus } from 'lucide-react';

export default function TransactionsPage() {
    const transactions = useTradingStore((state) => state.transactions);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <header className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <ReceiptText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Flujo de Caja</h1>
                    <p className="text-sm text-zinc-400">Registro inmutable de movimientos de capital y fees.</p>
                </div>
            </header>

            <div className="bg-[#121212] border border-zinc-800/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-900/50 border-b border-zinc-800/50 text-zinc-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Fecha</th>
                                <th className="px-6 py-4 font-medium">Tipo</th>
                                <th className="px-6 py-4 font-medium">Descripción</th>
                                <th className="px-6 py-4 font-medium text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 text-zinc-500">
                                        {new Date(tx.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {tx.type === 'Deposit' && <ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
                                            {tx.type === 'Withdrawal' && <ArrowUpRight className="w-4 h-4 text-zinc-400" />}
                                            {tx.type === 'Fee' && <Minus className="w-4 h-4 text-red-400" />}
                                            {tx.type === 'Adjustment' && <Plus className="w-4 h-4 text-blue-400" />}
                                            <span className="font-medium text-zinc-300">{tx.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400">
                                        {tx.description}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono">
                                        <span className={`font-medium ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {tx.asset}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                        No hay transacciones registradas.
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
