'use server';

import { fetchHistoricalData } from '@/lib/yahoo-finance';
import { 
  calculateRSI, 
  calculateMACD, 
  calculateEMA, 
  calculateVWMA, 
  calculateAveragePriceVolume 
} from '@/lib/technical-indicators';
import { detectSpikes } from '@/lib/spike-detection';
import { runBacktest } from '@/lib/backtest';
import type { MarketData, HistoricalData, CalculatedIndicators, RecentAverages, PriceSpike, BacktestResult } from '@/lib/types';
import { generateNarrativeInsights, type GenerateNarrativeInsightsInput } from '@/ai/flows/generate-narrative-insights';

export async function getMarketData(symbol: string): Promise<MarketData | { error: string }> {
  try {
    const rawHistoricalData = await fetchHistoricalData(symbol);
    if (!rawHistoricalData || rawHistoricalData.length === 0) {
      return { error: `No data found for symbol ${symbol}.` };
    }
    
    // Ensure data is sorted by date ascending
    const historicalData = rawHistoricalData.sort((a, b) => a.date.getTime() - b.date.getTime());
    const closePrices = historicalData.map(d => d.close);

    const indicators: CalculatedIndicators = {
      rsi14: calculateRSI(closePrices, 14).map(v => v === undefined ? NaN : v),
      macd: calculateMACD(closePrices, 12, 26, 9).map(m => m && m.macd !== undefined && m.signal !== undefined && m.histogram !== undefined ? { macd: m.macd, signal: m.signal, histogram: m.histogram } : { macd: NaN, signal: NaN, histogram: NaN }),
      ema200: calculateEMA(closePrices, 200).map(v => v === undefined ? NaN : v),
      vwma20: calculateVWMA(historicalData, 20).map(v => v === undefined ? NaN : v),
      ema50: calculateEMA(closePrices, 50).map(v => v === undefined ? NaN : v),
    };

    const recentAverages: RecentAverages = calculateAveragePriceVolume(historicalData, 5);
    const priceSpikes: PriceSpike[] = detectSpikes(historicalData, 20, 5); // lookback 20 for avg, scan last 5

    const backtestResult: BacktestResult = runBacktest(historicalData, indicators.vwma20, indicators.ema50);

    // Prepare input for AI insights
    // The AI flow expects full arrays for indicators, filter out NaNs if flow can't handle them
    // For simplicity, we pass them as is, assuming flow can handle or they are filtered by flow's zod schema later.
    const aiInput: GenerateNarrativeInsightsInput = {
      profitLoss: backtestResult.profitLoss,
      winRate: backtestResult.winRate / 100, // AI expects 0-1
      entryPoints: backtestResult.trades.length, // Number of trades initiated
      exitPoints: backtestResult.trades.filter(t => !t.isOpen).length, // Number of closed trades
      averageTradeLength: backtestResult.averageTradeLength,
      stockSymbol: symbol.toUpperCase(),
      rsiValues: indicators.rsi14.filter(v => !isNaN(v)),
      macdValues: indicators.macd.map(m => m.macd).filter(v => !isNaN(v)), // Assuming AI wants just MACD line
      ema200Values: indicators.ema200.filter(v => !isNaN(v)),
      vwmaValues: indicators.vwma20.filter(v => !isNaN(v)),
      ema50Values: indicators.ema50.filter(v => !isNaN(v)),
      recentPriceVolumeAverages: {
        averagePrice: recentAverages.averagePrice,
        averageVolume: recentAverages.averageVolume,
      },
      volumePriceSpikes: priceSpikes.map(s => s.description),
    };
    
    const aiInsights = await generateNarrativeInsights(aiInput);

    return {
      symbol,
      historicalData,
      indicators,
      recentAverages,
      priceSpikes,
      backtestResult,
      narrativeInsights: aiInsights.narrative,
    };

  } catch (error: any) {
    console.error(`Error processing market data for ${symbol}:`, error);
    return { error: error.message || `Failed to process data for ${symbol}.` };
  }
}
