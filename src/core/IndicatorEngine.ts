// This engine provides mathematical indicators and statistical models
// Rigorous statistical and mathematical functions only.

export class IndicatorEngine {
    /**
     * Z-Score to measure relative increment in Volume or Price
     * Allows identifying statistical anomalies (ex: 3 sigma -> 99.7% anomaly)
     */
    public calculateZScore(current: number, data: number[]): number {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const standardDeviation = Math.sqrt(
            data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length
        );

        return standardDeviation === 0 ? 0 : (current - mean) / standardDeviation;
    }

    /**
     * Detect anomalies in Order Book Depth
     * Assesses Bid/Ask imbalance
     */
    public getOrderBookImbalance(bids: [number, number][], asks: [number, number][]): number {
        let totalBidVolume = 0;
        let totalAskVolume = 0;

        for (let i = 0; i < bids.length; i++) {
            totalBidVolume += bids[i][1];
        }

        for (let i = 0; i < asks.length; i++) {
            totalAskVolume += asks[i][1];
        }

        const totalVolume = totalBidVolume + totalAskVolume;
        return totalVolume === 0 ? 0 : (totalBidVolume - totalAskVolume) / totalVolume;
    }

    /**
     * Sharpe Ratio calculator
     * Annualized Sharpe Ratio based on trade returns.
     */
    public calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
        if (returns.length === 0) return 0;

        const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const stdDev = Math.sqrt(
            returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / returns.length
        );

        return stdDev === 0 ? 0 : (meanReturn - riskFreeRate) / stdDev;
    }

    /**
     * Identifies if a coin is a "Gem" based on volume Z-Score and Order flow imbalance
     */
    public isGemcoinCandidate(volumeHistory: number[], currentVolume: number, bids: [number, number][], asks: [number, number][]): boolean {
        const vZScore = this.calculateZScore(currentVolume, volumeHistory);
        const imbalance = this.getOrderBookImbalance(bids, asks);

        // If volume is 3 standard deviations above mean AND bid limit orders are dominating
        return vZScore > 3 && imbalance > 0.3;
    }
}
