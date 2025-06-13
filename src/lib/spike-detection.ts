'use server';
import type { HistoricalData, PriceSpike } from '@/lib/types';

const SIGNIFICANT_CHANGE_THRESHOLD = 2; // e.g., 2 times the average

export function detectSpikes(
  historicalData: HistoricalData[],
  lookbackPeriodsForAverage: number = 20, // Use a longer period for a more stable average
  periodsToScan: number = 5 // Scan the most recent 5 periods
): PriceSpike[] {
  const spikes: PriceSpike[] = [];
  if (historicalData.length < Math.max(lookbackPeriodsForAverage, periodsToScan)) {
    return spikes; // Not enough data
  }

  const recentData = historicalData.slice(- (lookbackPeriodsForAverage + periodsToScan) );

  // Calculate average volume and price change over the lookback period (excluding the scan period)
  const avgCalculationData = recentData.slice(0, lookbackPeriodsForAverage);
  const volumes = avgCalculationData.map(d => d.volume);
  const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;

  const priceChanges: number[] = [];
  for (let i = 1; i < avgCalculationData.length; i++) {
    priceChanges.push(Math.abs(avgCalculationData[i].close - avgCalculationData[i-1].close) / avgCalculationData[i-1].close);
  }
  const avgPriceChangePercent = priceChanges.length > 0 ? priceChanges.reduce((sum, pc) => sum + pc, 0) / priceChanges.length : 0;

  // Scan the most recent N periods
  const dataToScan = historicalData.slice(-periodsToScan);

  for (let i = 0; i < dataToScan.length; i++) {
    const currentData = dataToScan[i];
    const dateStr = currentData.date.toISOString().split('T')[0];

    // Volume spike
    if (currentData.volume > avgVolume * SIGNIFICANT_CHANGE_THRESHOLD && avgVolume > 0) {
      spikes.push({
        date: dateStr,
        description: `Volume spike: ${currentData.volume.toLocaleString()} (Avg: ${avgVolume.toLocaleString()})`,
      });
    }

    // Price spike (based on daily change)
    if (i > 0 || historicalData.length > periodsToScan) { // Need previous day for price change
        const prevData = (i > 0) ? dataToScan[i-1] : historicalData[historicalData.length - periodsToScan - 1];
        if (prevData.close > 0) {
            const priceChangePercent = Math.abs(currentData.close - prevData.close) / prevData.close;
            if (priceChangePercent > avgPriceChangePercent * SIGNIFICANT_CHANGE_THRESHOLD && avgPriceChangePercent > 0) {
                 spikes.push({
                    date: dateStr,
                    description: `Price spike: ${ (priceChangePercent * 100).toFixed(2)}% change (Avg daily change: ${(avgPriceChangePercent * 100).toFixed(2)}%)`,
                });
            }
        }
    }
  }
  return spikes;
}
