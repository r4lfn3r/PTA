'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    TerminalSquare,
    ListChecks,
    History,
    ReceiptText,
    Settings,
    Activity
} from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Centro de Operaciones', href: '/bots', icon: TerminalSquare },
    { name: 'Propuestas Activas', href: '/proposals', icon: ListChecks },
    { name: 'Historial de Trades', href: '/trades', icon: History },
    { name: 'Transacciones', href: '/transactions', icon: ReceiptText },
    { name: 'Configuración', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const isSimulation = useTradingStore((state) => state.isSimulation);

    return (
        <aside className="w-64 h-screen bg-[#0A0A0A] border-r border-zinc-800/50 flex flex-col fixed left-0 top-0">
            {/* Logo y Estado */}
            <div className="p-6 border-b border-zinc-800/50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <Activity className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                        AlphaQuant
                    </h1>
                </div>

                <div className={`mt-4 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 w-fit
                    ${isSimulation
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                    <span className={`w-2 h-2 rounded-full ${isSimulation ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    {isSimulation ? 'MODO SIMULACIÓN (TESTNET)' : 'MODO PRODUCCIÓN (LIVE)'}
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                                ${isActive
                                    ? 'bg-white/5 text-white font-medium'
                                    : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                        >
                            <item.icon className={`w-5 h-5 transition-colors 
                                ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}
                            />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Panel de Info Inferior (Resumen rápido) */}
            <div className="p-4 border-t border-zinc-800/50 bg-black/20">
                <BalanceWidget />
            </div>
        </aside>
    );
}

function BalanceWidget() {
    const balance = useTradingStore((state) => state.balance);
    const hasBotsRunning = useTradingStore((state) => state.bots.some(b => b.state === 'Running'));

    return (
        <div className="space-y-3">
            <div>
                <p className="text-xs text-zinc-500 mb-1">Capital Asignado</p>
                <p className="text-lg font-mono text-zinc-200">
                    ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
            </div>

            <div className="flex items-center gap-2">
                <span className={`flex w-2 h-2 rounded-full ${hasBotsRunning ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-600'}`}></span>
                <span className="text-xs text-zinc-400">
                    {hasBotsRunning ? 'Bots en ejecución' : 'Todos los bots detenidos'}
                </span>
            </div>
        </div>
    );
}
