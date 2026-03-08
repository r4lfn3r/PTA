export class RiskManager {
    private baseCapital: number;
    private maxRiskPerTrade: number; // Percentage

    constructor(baseCapital: number = 10000, maxRiskPerTrade: number = 0.02) {
        this.baseCapital = baseCapital;
        this.maxRiskPerTrade = maxRiskPerTrade;
    }

    /**
     * Calculate ATR (Average True Range)
     * We need a history of (High, Low, Close) to compute true range.
     */
    public calculateATR(periods: number, highList: number[], lowList: number[], closeList: number[]): number {
        if (highList.length < periods + 1) return 0;

        let trList = [];
        for (let i = 1; i < highList.length; i++) {
            const high = highList[i];
            const low = lowList[i];
            const prevClose = closeList[i - 1];

            const tr1 = high - low;
            const tr2 = Math.abs(high - prevClose);
            const tr3 = Math.abs(low - prevClose);

            trList.push(Math.max(tr1, tr2, tr3));
        }

        // Simple Moving Average of TR for ATR
        const atr = trList.slice(-periods).reduce((a, b) => a + b, 0) / periods;
        return atr;
    }

    /**
     * Calculate Kelly Criterion
     * f* = (p * b - q) / b
     * p = probability of winning
     * q = probability of losing (1 - p)
     * b = proportion of the bet gained with a win (odds)
     */
    public calculateKelly(winProbability: number, winLossRatio: number, kellyFraction: number = 0.5): number {
        // We use a fractional Kelly (usually Half Kelly) for more conservative sizing
        const p = winProbability;
        const q = 1 - p;
        const b = winLossRatio; // Take Profit / Stop Loss distance ratio

        if (b === 0) return 0;

        let kelly = (p * b - q) / b;
        if (kelly < 0) return 0; // No edge

        return kelly * kellyFraction;
    }

    /**
     * Determine position size
     */
    public getPositionSize(
        currentPrice: number,
        atr: number,
        winProbability: number,
        winLossRatio: number,
        atrMultiplierForSL: number = 1.5
    ): { positionSizeAsset: number; usdtAmount: number; stopLoss: number; takeProfit: number; leverage: number } {
        const stopLossDistance = atr * atrMultiplierForSL;
        const stopLossPrice = currentPrice - stopLossDistance;
        const takeProfitPrice = currentPrice + (stopLossDistance * winLossRatio);

        // Capital allocation based on Kelly
        const kellyPct = this.calculateKelly(winProbability, winLossRatio);
        // Cap risk at max per trade
        const riskPct = Math.min(kellyPct, this.maxRiskPerTrade);

        const dollarRisk = this.baseCapital * riskPct;

        // Size = Risk / Distance
        const positionSizeAsset = dollarRisk / stopLossDistance;
        const usdtAmount = positionSizeAsset * currentPrice;

        // Suggest leverage based on minimum required margin
        const leverage = Math.ceil(usdtAmount / this.baseCapital);

        return {
            positionSizeAsset,
            usdtAmount,
            stopLoss: Math.max(0, stopLossPrice),
            takeProfit: takeProfitPrice,
            leverage: Math.max(1, Math.min(leverage, 20)) // Capped at 20x safely
        };
    }

    // Update capital
    public updateCapital(newCapital: number) {
        this.baseCapital = newCapital;
    }
}
