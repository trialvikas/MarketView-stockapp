// @ts-nocheck
// Disabling TypeScript checks for yahoo-finance2 as it might have type inconsistencies.
'use server';
import type { HistoricalData } from '@/lib/types';
import yahooFinance from 'yahoo-finance2';

export async function fetchHistoricalData(symbol: string): Promise<HistoricalData[]> {
  const fifteenYearsAgo = new Date();
  fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);

  const queryOptions = {
    period1: fifteenYearsAgo.toISOString().split('T')[0], // YYYY-MM-DD
    interval: '1d' as const,
  };

  try {
    const results = await yahooFinance.historical(symbol, queryOptions);
    return results.map(item => ({
      date: new Date(item.date),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
      adjClose: item.adjClose,
    }));
  } catch (error) {
    console.error(`Failed to fetch historical data for ${symbol}:`, error);
    throw new Error(`Could not fetch data for ${symbol}. Please check the symbol and try again.`);
  }
}
