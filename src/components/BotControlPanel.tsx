'use client';

import React, { useState } from 'react';
import { Power, Settings, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTradingStore } from '@/store/useTradingStore';
import { ApiConfigModal } from './ApiConfigModal';

export function BotControlPanel() {
    const { bots, toggleBot, isSimulation, setSimulation, addLog } = useTradingStore();
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-3xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-400" /> Control System
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1">Manage execution engines</p>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsConfigOpen(true)}
                        className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-900/50">
                    <div>
                        <div className="text-white font-medium mb-1">Execution Mode</div>
                        <div className="text-zinc-500 text-xs truncate max-w-[200px]">
                            {isSimulation ? 'Paper Trading / Validating Data' : 'Live Execution / Real Capital'}
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setSimulation(!isSimulation);
                            addLog(`Switched to ${!isSimulation ? 'Simulation' : 'Live Mainnet'} mode`, 'warning');
                        }}
                        className={cn(
                            "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                            isSimulation ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" : "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                        )}
                    >
                        {isSimulation ? 'TESTNET (SIMULATION)' : 'MAINNET LIVE'}
                    </button>
                </div>

                {bots.map((bot) => (
                    <div key={bot.id} className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-900/50">
                        <div>
                            <div className="text-white font-medium mb-1 text-sm">{bot.name}</div>
                            <div className="text-zinc-500 text-xs">
                                Stats: {bot.state === 'Running' ? 'Active' : 'Standby'}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                toggleBot(bot.id);
                                addLog(`${bot.name} ${bot.state === 'Running' ? 'Stopped' : 'Started'}`, 'info', bot.id);
                            }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-lg",
                                bot.state === 'Running'
                                    ? "bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-500"
                                    : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                            )}
                        >
                            <Power className="w-4 h-4" />
                            {bot.state === 'Running' ? 'RUNNING' : 'START'}
                        </button>
                    </div>
                ))}

                {!isSimulation && bots.some(b => b.state === 'Running') && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 mt-4">
                        <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                        <div className="text-xs text-rose-400 font-medium">
                            Warning: Bots are active in Mainnet with real capital. Risk Manager is enforcing dynamic Kelly position sizing.
                        </div>
                    </div>
                )}
            </div>

            <ApiConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
        </div>
    );
}
