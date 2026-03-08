'use client';

import { useTradingStore } from '@/store/useTradingStore';
import { ListChecks, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ProposalsPage() {
    const proposals = useTradingStore((state) => state.proposals);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending': return <Clock className="w-4 h-4 text-amber-500" />;
            case 'Approved': return <CheckCircle2 className="w-4 h-4 text-indigo-400" />;
            case 'Rejected': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'Executed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            default: return <AlertCircle className="w-4 h-4 text-zinc-500" />;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'Approved': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            case 'Rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'Executed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <header className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <ListChecks className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Cola de Propuestas</h1>
                    <p className="text-sm text-zinc-400">Evaluación de las señales generadas por el Watcher Bot.</p>
                </div>
            </header>

            <div className="bg-[#121212] border border-zinc-800/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-900/50 border-b border-zinc-800/50 text-zinc-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Hora</th>
                                <th className="px-6 py-4 font-medium">Par</th>
                                <th className="px-6 py-4 font-medium">Tipo</th>
                                <th className="px-6 py-4 font-medium">Precio</th>
                                <th className="px-6 py-4 font-medium">Volumen</th>
                                <th className="px-6 py-4 font-medium">Estado</th>
                                <th className="px-6 py-4 font-medium w-full">Razón de Riesgo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {proposals.map((p) => (
                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 text-zinc-500">
                                        {new Date(p.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4 font-mono font-medium text-zinc-300">
                                        {p.symbol}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold
                                            ${p.type === 'BUY' ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                            {p.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-zinc-300">
                                        ${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-zinc-400">
                                        {p.amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusStyle(p.status)}`}>
                                            {getStatusIcon(p.status)}
                                            {p.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500 max-w-xs truncate" title={p.riskReasoning || 'N/A'}>
                                        {p.riskReasoning || '-'}
                                    </td>
                                </tr>
                            ))}
                            {proposals.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                        No hay propuestas generadas todavía. Inicia el bot Analista (Watcher).
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
