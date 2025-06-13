'use server';
import type { HistoricalData } from '@/lib/types';

// SMA (Simple Moving Average) - Helper for RSI and MACD
function calculateSMA(data: number[], period: number): (number | undefined)[] {
  if (data.length < period) return new Array(data.length).fill(undefined);
  const sma: (number | undefined)[] = new Array(period - 1).fill(undefined);
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
    sma.push(sum / period);
  }
  return sma;
}

// EMA (Exponential Moving Average)
export function calculateEMA(prices: number[], period: number): (number | undefined)[] {
  if (prices.length < period) return new Array(prices.length).fill(undefined);
  
  const ema: (number | undefined)[] = new Array(prices.length).fill(undefined);
  const k = 2 / (period + 1);
  
  // Calculate initial SMA for the first EMA value
  let sumForSma = 0;
  for (let i = 0; i < period; i++) {
    sumForSma += prices[i];
  }
  ema[period - 1] = sumForSma / period;

  // Calculate subsequent EMA values
  for (let i = period; i < prices.length; i++) {
    ema[i] = (prices[i] * k) + (ema[i-1]! * (1 - k));
  }
  return ema;
}

// RSI (Relative Strength Index)
export function calculateRSI(prices: number[], period: number): (number | undefined)[] {
  if (prices.length <= period) return new Array(prices.length).fill(undefined);

  const rsi: (number | undefined)[] = new Array(period).fill(undefined);
  let gains: number[] = [];
  let losses: number[] = [];

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i-1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }
  
  let avgGain = gains.reduce((sum, val) => sum + val, 0) / period;
  let avgLoss = losses.reduce((sum, val) => sum + val, 0) / period;

  rsi.push(avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss)));

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i-1];
    const currentGain = diff > 0 ? diff : 0;
    const currentLoss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
    
    rsi.push(avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss)));
  }
  return rsi;
}

// MACD (Moving Average Convergence Divergence)
export function calculateMACD(prices: number[], shortPeriod: number, longPeriod: number, signalPeriod: number) {
  const emaShort = calculateEMA(prices, shortPeriod);
  const emaLong = calculateEMA(prices, longPeriod);
  
  const macdLine: (number | undefined)[] = emaLong.map((val, idx) => 
    (val !== undefined && emaShort[idx] !== undefined) ? emaShort[idx]! - val : undefined
  );

  const validMacdValues = macdLine.filter(val => val !== undefined) as number[];
  const signalLinePadded = calculateEMA(validMacdValues, signalPeriod);
  
  const signalLine: (number | undefined)[] = new Array(prices.length).fill(undefined);
  let j = 0;
  for(let i=0; i < macdLine.length; i++) {
    if (macdLine[i] !== undefined) {
      if (j < signalLinePadded.length) {
         signalLine[i] = signalLinePadded[j];
         j++;
      }
    }
  }
  
  const histogram: (number | undefined)[] = macdLine.map((val, idx) =>
    (val !== undefined && signalLine[idx] !== undefined) ? val - signalLine[idx]! : undefined
  );

  return prices.map((_, idx) => ({
      macd: macdLine[idx],
      signal: signalLine[idx],
      histogram: histogram[idx],
  }));
}


// VWMA (Volume Weighted Moving Average)
export function calculateVWMA(data: HistoricalData[], period: number): (number | undefined)[] {
  if (data.length < period) return new Array(data.length).fill(undefined);

  const vwma: (number | undefined)[] = new Array(period - 1).fill(undefined);
  for (let i = period - 1; i < data.length; i++) {
    const currentSlice = data.slice(i - period + 1, i + 1);
    const sumPriceVolume = currentSlice.reduce((acc, val) => acc + (val.close * val.volume), 0);
    const sumVolume = currentSlice.reduce((acc, val) => acc + val.volume, 0);
    vwma.push(sumVolume === 0 ? currentSlice[currentSlice.length-1].close : sumPriceVolume / sumVolume);
  }
  return vwma;
}

// Average Price and Volume for the last N periods
export function calculateAveragePriceVolume(data: HistoricalData[], period: number) {
  if (data.length < period) {
    return { averagePrice: 0, averageVolume: 0 };
  }
  const lastNPeriods = data.slice(-period);
  const sumPrice = lastNPeriods.reduce((acc, val) => acc + val.close, 0);
  const sumVolume = lastNPeriods.reduce((acc, val) => acc + val.volume, 0);
  return {
    averagePrice: sumPrice / period,
    averageVolume: sumVolume / period,
  };
}
