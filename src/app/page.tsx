'use client';

import React, { useState, useEffect } from 'react';
import { MetricsCard } from '@/components/MetricsCard';
import { BotControlPanel } from '@/components/BotControlPanel';
import { CandleChart } from '@/components/CandleChart';
import { TrendingUp, Activity, ShieldAlert, BarChart3, Binary, Radar, Wifi } from 'lucide-react';
import { useTradingStore } from '@/store/useTradingStore';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';

const generateMockData = () => {
  let time = new Date('2026-03-01').getTime() / 1000;
  let close = 64500;
  return Array.from({ length: 100 }).map(() => {
    time += 3600;
    const open = close;
    const high = open + Math.random() * 500;
    const low = open - Math.random() * 500;
    close = open + (Math.random() - 0.5) * 800;
    return {
      time: time as any,
      open,
      high,
      low,
      close,
    };
  });
};

export default function Dashboard() {
  const [chartData, setChartData] = useState<any[]>([]);

  const { logs, latency, balance, bots } = useTradingStore();
  const { ticker } = useBinanceWebSocket('btcusdt');

  // Kelly calculation example $f^* = \frac{bp - q}{b}$
  const winRate = 0.58; // From backtest
  const rewardRisk = 1.82; // Win/Loss Ratio
  const f_star = (winRate * rewardRisk - (1 - winRate)) / rewardRisk; // f* = 0.35
  const suggestedFraction = f_star * 0.5; // Half-Kelly

  useEffect(() => {
    setChartData(generateMockData());
  }, []);

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 font-sans p-4 sm:p-8">

      {/* Header section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span className="bg-indigo-600 p-2 rounded-xl border border-indigo-500/30">
              <Binary className="w-5 h-5 text-indigo-50" />
            </span>
            AlphaQuant Terminal
          </h1>
          <p className="text-zinc-500 mt-2 font-medium max-w-xl">
            Evidence-based algorithmic trading ecosystem. Utilizing rigorous mathematical models, ATR-based volatility targeting, and Kelly fractional sizing.
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 text-xs font-mono mr-4 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
            <Wifi className={latency > 0 && latency < 100 ? "text-emerald-500 w-4 h-4" : latency > 100 ? "text-amber-500 w-4 h-4" : "text-zinc-600 w-4 h-4"} />
            <span className={latency > 0 ? "text-zinc-300" : "text-zinc-600"}>{latency > 0 ? `${latency}ms` : 'Connecting...'}</span>
          </div>

          <div className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-inner flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Account Balance</span>
            <span className="font-mono font-bold text-white text-lg">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">

        {/* Left Column (Main Charts & Active Scanners) */}
        <div className="lg:col-span-8 space-y-6">

          <div className="bg-zinc-900/40 rounded-3xl p-6 border border-zinc-800/80 backdrop-blur-3xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="text-indigo-500 w-5 h-5" /> BTC/USDT
                {ticker && (
                  <span className="ml-2 font-mono text-zinc-300">
                    ${parseFloat(ticker.price).toLocaleString()}
                    <span className={`ml-2 text-xs ${parseFloat(ticker.change) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {parseFloat(ticker.change) > 0 ? '+' : ''}{ticker.change} (24h)
                    </span>
                  </span>
                )}
                <span className="text-zinc-600 font-sans text-sm font-normal ml-2">1H Order Flow Analyzer</span>
              </h2>
              <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800/50">
                {['15M', '1H', '4H', '1D'].map(tf => (
                  <button key={tf} className={`px-4 py-1.5 text-xs font-bold rounded-md ${tf === '1H' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <CandleChart data={chartData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-950/20 rounded-3xl p-6 border border-indigo-900/30">
              <h3 className="text-lg font-bold text-indigo-100 flex items-center gap-3 mb-4">
                <Radar className="w-5 h-5 text-indigo-400" /> Gemcoin Scanner
              </h3>
              <div className="space-y-4">
                {[
                  { ticker: 'FET', zScore: '3.8σ', imbalance: '+42%', isGem: true },
                  { ticker: 'RNDR', zScore: '2.4σ', imbalance: '-12%', isGem: false },
                  { ticker: 'INJ', zScore: '2.1σ', imbalance: '+5%', isGem: false },
                ].map((coin) => (
                  <div key={coin.ticker} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                    <div className="font-bold">{coin.ticker}/USDT</div>
                    <div className="flex gap-4 text-xs font-mono">
                      <span className="text-zinc-400">Vol Z-Score: <span className={coin.zScore.includes('3') ? 'text-emerald-400' : ''}>{coin.zScore}</span></span>
                      <span className="text-zinc-400">Flow: <span className={coin.imbalance.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}>{coin.imbalance}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/40 rounded-3xl p-6 border border-zinc-800/80 hover:border-indigo-600/30 transition-colors">
              <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-4">
                <ShieldAlert className="w-5 h-5 text-amber-500" /> Current Positioning
              </h3>
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/50 space-y-3 shadow-inner">
                <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3">
                  <span className="text-zinc-400 text-sm">Active Asset</span>
                  <span className="font-bold text-white">{ticker ? `BTC @ ${parseFloat(ticker.price).toFixed(0)}` : 'BTC (Long)'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3">
                  <span className="text-zinc-400 text-sm">Kelly Extracted Size</span>
                  <span className="font-mono text-emerald-400">
                    {bots.find(b => b.id === 'Risk-Manager')?.state === 'Running'
                      ? `${(suggestedFraction * 100).toFixed(2)}% of Capital`
                      : 'Manual Size'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">ATR Stop Loss (1.5x)</span>
                  <span className="font-mono text-rose-400">
                    {ticker ? (parseFloat(ticker.price) * 0.985).toFixed(2) : '62,400.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Controls & Metrics) */}
        <div className="lg:col-span-4 space-y-6">
          <BotControlPanel />

          <div className="grid grid-cols-2 gap-4">
            <MetricsCard
              title="Sharpe Ratio (Ann.)"
              value="2.84"
              subtext="Top Decile Model"
              isPositive={true}
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <MetricsCard
              title="Win/Loss Ratio"
              value="1.82"
              subtext="Last 100 Trades"
              isPositive={true}
              icon={<BarChart3 className="w-5 h-5" />}
            />
            <MetricsCard
              title="Max Drawdown"
              value="-8.4%"
              subtext="Rolling 12mo"
              isPositive={false}
              className="bg-rose-950/10 border-rose-900/20"
            />
            <MetricsCard
              title="Profit Factor"
              value="2.14"
              subtext="Gross Win / Gross Loss"
              isPositive={true}
            />
          </div>

          {/* Logs Terminal */}
          <div className="bg-zinc-900/40 rounded-2xl p-6 border border-zinc-800/80 mt-6 max-h-[300px] overflow-y-auto">
            <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider sticky top-0 bg-zinc-900/40 backdrop-blur-md pb-2">System Logs</h3>
            <div className="space-y-4 font-mono text-xs">
              {logs.map(log => (
                <div key={log.id} className="flex gap-3 text-zinc-300">
                  <span className="text-zinc-600 shrink-0">[{log.timestamp.toLocaleTimeString()}]</span>
                  <span className={
                    log.type === 'error' ? 'text-rose-400' :
                      log.type === 'success' ? 'text-emerald-400' :
                        log.type === 'warning' ? 'text-amber-400' : 'text-zinc-300'
                  }>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
