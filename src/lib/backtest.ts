'use server';
import type { HistoricalData, Trade, BacktestResult } from '@/lib/types';

export function runBacktest(
  data: HistoricalData[],
  vwma20: (number | undefined)[],
  ema50: (number | undefined)[]
): BacktestResult {
  const trades: Trade[] = [];
  let positionOpen = false;
  let currentTrade: Trade | null = null;
  let profitLoss = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let totalTradeLength = 0; // in days

  for (let i = 1; i < data.length; i++) { // Start from 1 to check previous values
    const currentData = data[i];
    const prevData = data[i-1];
    const currentVwma20 = vwma20[i];
    const prevVwma20 = vwma20[i-1];
    const currentEma50 = ema50[i];
    const prevEma50 = ema50[i-1];

    if (currentVwma20 === undefined || prevVwma20 === undefined || currentEma50 === undefined || prevEma50 === undefined) {
      continue; // Skip if indicator data is not available
    }

    const dateStr = currentData.date.toISOString().split('T')[0];

    // Entry condition: 20 VWMA crosses above 50 EMA
    if (!positionOpen && currentVwma20 > currentEma50 && prevVwma20 <= prevEma50) {
      positionOpen = true;
      currentTrade = {
        entryDate: dateStr,
        entryPrice: currentData.close,
        isOpen: true,
      };
      trades.push(currentTrade);
    } 
    // Exit condition: Entire candle closes below 20 VWMA AND VWMA is below 50 EMA
    // "Entire candle closes below" interpreted as High < VWMA
    else if (positionOpen && currentTrade && currentData.high < currentVwma20 && currentVwma20 < currentEma50) {
      positionOpen = false;
      currentTrade.exitDate = dateStr;
      currentTrade.exitPrice = currentData.close;
      currentTrade.profit = currentTrade.exitPrice - currentTrade.entryPrice;
      currentTrade.profitPercentage = (currentTrade.profit / currentTrade.entryPrice) * 100;
      
      const entryD = new Date(currentTrade.entryDate);
      const exitD = new Date(currentTrade.exitDate);
      currentTrade.tradeLength = Math.round((exitD.getTime() - entryD.getTime()) / (1000 * 60 * 60 * 24));
      totalTradeLength += currentTrade.tradeLength;

      profitLoss += currentTrade.profit;
      if (currentTrade.profit > 0) {
        winningTrades++;
      } else if (currentTrade.profit < 0) {
        losingTrades++;
      }
      currentTrade.isOpen = false;
      currentTrade = null;
    }
  }

  // If a trade is still open at the end of the data, mark it as open
  if (positionOpen && currentTrade) {
    // No P/L calculation for open trade unless we use last price as hypothetical exit
  }

  const totalTrades = trades.filter(t => !t.isOpen).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const averageTradeLength = totalTrades > 0 ? totalTradeLength / totalTrades : 0;

  // Calculate average win/loss (simplified)
  const closedProfitableTrades = trades.filter(t => !t.isOpen && t.profit !== undefined && t.profit > 0);
  const closedLosingTrades = trades.filter(t => !t.isOpen && t.profit !== undefined && t.profit < 0);

  const averageWin = closedProfitableTrades.length > 0 
    ? closedProfitableTrades.reduce((sum, t) => sum + t.profit!, 0) / closedProfitableTrades.length
    : undefined;
  const averageLoss = closedLosingTrades.length > 0
    ? closedLosingTrades.reduce((sum, t) => sum + t.profit!, 0) / closedLosingTrades.length
    : undefined;


  return {
    trades,
    profitLoss,
    winRate,
    totalTrades,
    winningTrades,
    losingTrades,
    averageTradeLength,
    averageWin,
    averageLoss,
    // maxDrawdown calculation is complex and omitted for brevity
  };
}
