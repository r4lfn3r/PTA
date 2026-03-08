import Binance from 'binance-api-node';

export class BinanceClient {
    private client: ReturnType<typeof Binance>;
    private isTestnet: boolean;

    constructor(apiKey: string, apiSecret: string, isTestnet: boolean = true) {
        this.isTestnet = isTestnet;
        this.client = Binance({
            apiKey: apiKey,
            apiSecret: apiSecret,
            httpBase: isTestnet ? 'https://testnet.binance.vision' : 'https://api.binance.com'
        });
    }

    public async getAccountBalance() {
        return await this.client.accountInfo();
    }

    public async getMarketData(symbol: string, interval: string = '1h') {
        return await this.client.candles({ symbol, interval: interval as any });
    }

    public async getOrderBook(symbol: string) {
        return await this.client.book({ symbol, limit: 100 });
    }

    public async placeMarketBuyOrder(symbol: string, quantity: number) {
        return await this.client.order({
            symbol: symbol,
            side: 'BUY' as any,
            type: 'MARKET' as any,
            quantity: quantity.toString(),
        });
    }

    public async placeMarketSellOrder(symbol: string, quantity: number) {
        return await this.client.order({
            symbol: symbol,
            side: 'SELL' as any,
            type: 'MARKET' as any,
            quantity: quantity.toString(),
        });
    }

    public switchNetwork(isTestnet: boolean) {
        this.isTestnet = isTestnet;
    }
}
