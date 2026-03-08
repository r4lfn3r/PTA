'use client';

import React, { useState } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { ShieldCheck, PlusCircle } from 'lucide-react';

export function ApiConfigModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { isSimulation, setSimulation, setApiKeyConfigured, addLog } = useTradingStore();

    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey, apiSecret, isSimulation })
            });

            if (res.ok) {
                setApiKeyConfigured(true);
                addLog('Binance API Keys securely encrypted and saved', 'success');
                onClose();
            } else {
                const err = await res.json();
                addLog(`Error saving API Keys: ${err.error}`, 'error');
            }
        } catch (err: any) {
            addLog(`Network Error: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-indigo-500" /> API Configuration
                </h2>
                <p className="text-sm text-zinc-400 mb-6">Enter your Binance API keys. Keys are AES-256 encrypted on the server before storage.</p>

                <form onSubmit={handleSubmit} className="space-y-4 text-sm font-medium">
                    <div>
                        <label className="block text-zinc-400 mb-1">API Key</label>
                        <input
                            required
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="Binance API Key..."
                        />
                    </div>
                    <div>
                        <label className="block text-zinc-400 mb-1">API Secret</label>
                        <input
                            required
                            type="password"
                            value={apiSecret}
                            onChange={(e) => setApiSecret(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="••••••••••••••••"
                        />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="sim"
                            checked={isSimulation}
                            onChange={(e) => setSimulation(e.target.checked)}
                            className="w-4 h-4 bg-zinc-900 border border-zinc-700 rounded text-indigo-500 focus:ring-indigo-500"
                        />
                        <label htmlFor="sim" className="text-zinc-300">Run in Simulation Mode (Testnet)</label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
                        >
                            {loading ? 'Encrypting...' : 'Save Configuration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
