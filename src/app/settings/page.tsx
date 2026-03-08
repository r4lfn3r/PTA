'use client';

import { useTradingStore } from '@/store/useTradingStore';
import { Settings, ShieldCheck, Key, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
    const isSimulation = useTradingStore((state) => state.isSimulation);
    const setSimulation = useTradingStore((state) => state.setSimulation);
    const apiKeyConfigured = useTradingStore((state) => state.apiKeyConfigured);

    // Config de bots
    const bots = useTradingStore((state) => state.bots);
    const updateBotConfig = useTradingStore((state) => state.updateBotConfig);

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <header className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-zinc-800 rounded-lg border border-zinc-700">
                    <Settings className="w-6 h-6 text-zinc-300" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Configuración del Sistema</h1>
                    <p className="text-sm text-zinc-400">Preferencias globales y gestión de riesgos.</p>
                </div>
            </header>

            {/* Global Settings */}
            <section className="bg-[#121212] border border-zinc-800/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    Entorno de Ejecución
                </h2>
                <div className="flex items-center justify-between p-4 bg-black/40 border border-zinc-800 rounded-lg">
                    <div>
                        <p className="font-medium text-zinc-200">Testnet (Simulación)</p>
                        <p className="text-xs text-zinc-500 mt-1">
                            Asegura que todas las órdenes se enruten a Binance Testnet. El dinero es ficticio.
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isSimulation}
                            onChange={(e) => setSimulation(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
            </section>

            {/* API Keys */}
            <section className="bg-[#121212] border border-zinc-800/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-400" />
                    Credenciales Exchange
                </h2>
                <div className="space-y-4">
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <p className="text-sm text-amber-500 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${apiKeyConfigured ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                            Estado: {apiKeyConfigured ? 'Conectado de forma segura' : 'API Keys no configuradas'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1">API Key</label>
                            <input type="password" placeholder="Ingresa tu API Key de Binance" className="w-full bg-black border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500" disabled />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1">Secret Key</label>
                            <input type="password" placeholder="Ingresa tu Secret Key" className="w-full bg-black border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500" disabled />
                        </div>
                    </div>
                    <button className="bg-white text-black px-4 py-2 rounded-md font-medium text-sm hover:bg-zinc-200 transition-colors">
                        Actualizar Credenciales (Demo)
                    </button>
                </div>
            </section>

            {/* Tuning de Bots (Sencillo) */}
            <section className="bg-[#121212] border border-zinc-800/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-purple-400" />
                    Ajuste Fino de Agentes
                </h2>

                <div className="space-y-4">
                    {bots.map(bot => (
                        <div key={bot.id} className="p-4 bg-black/40 border border-zinc-800 rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <h3 className="font-medium text-zinc-300">{bot.name}</h3>
                                <p className="text-xs text-zinc-500 mt-1">Configuración actual: {JSON.stringify(bot.config)}</p>
                            </div>

                            {/* Inputs de ejemplo (podrían ser dinámicos) */}
                            {bot.id === 'Risk-Manager' && (
                                <div className="flex items-center gap-3">
                                    <label className="text-sm text-zinc-400">Max Risk (%):</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-20 bg-black border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200"
                                        value={bot.config.maxRiskPerTrade || 0.02}
                                        onChange={(e) => updateBotConfig('Risk-Manager', { maxRiskPerTrade: parseFloat(e.target.value) })}
                                    />
                                </div>
                            )}

                            {bot.id === 'Hunter' && (
                                <div className="flex items-center gap-3">
                                    <label className="text-sm text-zinc-400">Z-Score Umbral:</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-20 bg-black border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200"
                                        value={bot.config.zScoreThreshold || 2.0}
                                        onChange={(e) => updateBotConfig('Hunter', { zScoreThreshold: parseFloat(e.target.value) })}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
