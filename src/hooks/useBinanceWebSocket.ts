'use client';
import { useState, useCallback, useEffect } from 'react';
import { useTradingStore } from '@/store/useTradingStore';

export function useBinanceWebSocket(symbol: string = 'btcusdt') {
    const [ticker, setTicker] = useState<{ price: string; change: string; volume: string } | null>(null);
    const { setLatency } = useTradingStore();

    useEffect(() => {
        let ws: WebSocket;
        let pingInterval: NodeJS.Timeout;

        const connect = () => {
            // Connect to binance stream for ticker
            ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);

            ws.onopen = () => {
                // Simple latency check to binance using an API endpoint, since WS ping/pong is tricky in browser
                pingInterval = setInterval(async () => {
                    const start = performance.now();
                    try {
                        await fetch('https://api.binance.com/api/v3/ping');
                        const latency = Math.round(performance.now() - start);
                        setLatency(latency);
                    } catch (e) {
                        console.error('Ping failed');
                    }
                }, 5000);
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.e === '24hrTicker') {
                    setTicker({
                        price: parseFloat(data.c).toFixed(2),
                        change: parseFloat(data.P).toFixed(2),
                        volume: parseFloat(data.v).toFixed(2)
                    });
                }
            };

            ws.onerror = (e) => {
                console.error('WS Error:', e);
            };

            ws.onclose = () => {
                // Reconnect logic
                setTimeout(connect, 3000);
            };
        };

        connect();

        return () => {
            if (ws) ws.close();
            if (pingInterval) clearInterval(pingInterval);
        };
    }, [symbol, setLatency]);

    return { ticker };
}
