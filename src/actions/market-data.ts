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
// Removed: import { generateNarrativeInsights, type GenerateNarrativeInsightsInput } from '@/ai/flows/generate-narrative-insights';

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

    // AI Insights generation removed
    // const aiInput: GenerateNarrativeInsightsInput = { ... };
    // const aiInsights = await generateNarrativeInsights(aiInput);

    return {
      symbol,
      historicalData,
      indicators,
      recentAverages,
      priceSpikes,
      backtestResult,
      narrativeInsights: undefined, // Set to undefined or remove if type changes allow
    };

  } catch (error: any) {
    console.error(`Error processing market data for ${symbol}:`, error);
    // If the error is related to API key and AI is disabled, this specific error might not occur
    // but other errors during data fetching/processing can still happen.
    return { error: error.message || `Failed to process data for ${symbol}.` };
  }
}
