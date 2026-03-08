'use client';

import { useTradingStore } from '@/store/useTradingStore';
import { TerminalSquare, Play, Square, Activity } from 'lucide-react';
import { BotRole } from '@/types/trading';

export default function BotsControlCenter() {
    const bots = useTradingStore((state) => state.bots);
    const botEvents = useTradingStore((state) => state.botEvents);
    const toggleBot = useTradingStore((state) => state.toggleBot);

    // Colores por rol para la terminal
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Watcher': return 'text-cyan-400';
            case 'RiskManager': return 'text-amber-400';
            case 'Trader': return 'text-emerald-400';
            case 'System': return 'text-indigo-400';
            case 'Orchestrator': return 'text-purple-400';
            default: return 'text-zinc-400';
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                    <TerminalSquare className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Centro de Operaciones</h1>
                    <p className="text-sm text-zinc-400">Control individual de agentes y terminal de eventos en tiempo real.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Panel de Control de Bots (Izquierda) */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
                        <Activity className="w-5 h-5" /> Estado de Agentes
                    </h2>

                    {bots.map((bot) => (
                        <div key={bot.id} className="bg-[#121212] border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-zinc-200">{bot.name}</h3>
                                    <p className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded mt-1 inline-block">
                                        ID: {bot.id}
                                    </p>
                                </div>
                                <span className={`flex h-3 w-3 relative`}>
                                    {bot.state === 'Running' && (
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    )}
                                    <span className={`relative inline-flex rounded-full h-3 w-3 ${bot.state === 'Running' ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
                                </span>
                            </div>

                            <button
                                onClick={() => toggleBot(bot.id)}
                                className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors
                                    ${bot.state === 'Running'
                                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'}`}
                            >
                                {bot.state === 'Running' ? (
                                    <><Square className="w-4 h-4 fill-current" /> Detener</>
                                ) : (
                                    <><Play className="w-4 h-4 fill-current" /> Iniciar</>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Terminal de Eventos en Vivo (Derecha) */}
                <div className="lg:col-span-2 bg-black border border-zinc-800/50 rounded-xl overflow-hidden flex flex-col h-[600px]">
                    <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800/50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                            </div>
                            <span className="ml-2 text-xs font-mono text-zinc-500">Event_Bus_Terminal.exe</span>
                        </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-3 bg-[#050505]">
                        {botEvents.map((evt) => (
                            <div key={evt.id} className="flex gap-3 leading-relaxed">
                                <span className="text-zinc-600 shrink-0">
                                    [{new Date(evt.timestamp).toLocaleTimeString()}]
                                </span>
                                <span className={`font-semibold shrink-0 ${getRoleColor(evt.source.toString())}`}>
                                    {evt.source}
                                </span>
                                <span className="text-zinc-700 shrink-0">→</span>
                                <span className={`font-semibold shrink-0 ${getRoleColor(evt.target.toString())}`}>
                                    {evt.target}:
                                </span>
                                <span className="text-zinc-300">
                                    {evt.message}
                                </span>
                            </div>
                        ))}
                        {botEvents.length === 0 && (
                            <div className="text-zinc-600 italic">Esperando eventos del sistema...</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
