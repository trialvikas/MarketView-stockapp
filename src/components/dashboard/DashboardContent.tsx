
import type { MarketData, ChartDataPoint } from '@/lib/types';
import { MainChart } from './MainChart';
import { StatCard } from './StatCard';
import { TradesTable } from './TradesTable';
import { NarrativeCard } from './NarrativeCard'; // Kept for future re-enablement if needed
import { StrategyDescriptionCard } from './StrategyDescriptionCard'; // New component
import { CumulativeProfitChart } from './CumulativeProfitChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Percent, BarChartBig, Clock, HelpCircle, Sigma, ListTree, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

type DashboardContentProps = {
  data: MarketData;
};

function getLatestValue(arr: (number | undefined)[]): number | string {
  const L = arr.length;
  for(let i = L - 1; i >= 0; i--) {
    if (arr[i] !== undefined && !isNaN(arr[i] as number)) return (arr[i] as number);
  }
  return 'N/A';
}

function getLatestMacdValue(arr: Array<{macd?: number, signal?: number, histogram?: number} | undefined>): string {
    const L = arr.length;
    for(let i = L-1; i>=0; i--) {
        if(arr[i]?.macd !== undefined && !isNaN(arr[i]!.macd!)) {
            return `MACD: ${arr[i]!.macd!.toFixed(2)}, Signal: ${arr[i]!.signal?.toFixed(2)}, Hist: ${arr[i]!.histogram?.toFixed(2)}`
        }
    }
    return 'N/A';
}


export function DashboardContent({ data }: DashboardContentProps) {
  const { symbol, historicalData, indicators, recentAverages, priceSpikes, backtestResult, narrativeInsights } = data;

  const chartData: ChartDataPoint[] = historicalData.map((item, index) => ({
    date: format(item.date, 'yyyy-MM-dd'),
    price: item.close,
    open: item.open,
    high: item.high,
    low: item.low,
    volume: item.volume,
    vwma20: indicators.vwma20[index],
    ema50: indicators.ema50[index],
    ema200: indicators.ema200[index],
    hasSpike: false, 
    spikeDescriptions: [], 
  }));

  backtestResult.trades.forEach(trade => {
    const entryIndex = chartData.findIndex(d => d.date === trade.entryDate);
    if (entryIndex !== -1) {
      chartData[entryIndex].trade = 'buy';
    }
    if (trade.exitDate) {
      const exitIndex = chartData.findIndex(d => d.date === trade.exitDate);
      if (exitIndex !== -1) {
        chartData[exitIndex].trade = 'sell';
      }
    }
  });

  priceSpikes.forEach(spike => {
    const chartIndex = chartData.findIndex(d => d.date === spike.date);
    if (chartIndex !== -1) {
      chartData[chartIndex].hasSpike = true;
      chartData[chartIndex].spikeDescriptions!.push(spike.description);
    }
  });


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MainChart data={chartData} symbol={symbol} />
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg">
             <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">Key Indicators</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <StatCard title="RSI (14)" value={getLatestValue(indicators.rsi14)} icon={<Sigma />} description="Latest Value" />
                <StatCard title="EMA (200)" value={(getLatestValue(indicators.ema200) as number).toFixed(2)} icon={<TrendingUp />} description="Latest Value" valueClassName="text-sm" />
                <StatCard title="VWMA (20)" value={(getLatestValue(indicators.vwma20) as number).toFixed(2)} icon={<BarChartBig />} description="Latest Value" valueClassName="text-sm" />
                <StatCard title="EMA (50)" value={(getLatestValue(indicators.ema50) as number).toFixed(2)} icon={<TrendingDown />} description="Latest Value" valueClassName="text-sm" />
                 <StatCard title="MACD" value={getLatestMacdValue(indicators.macd)} icon={<ListTree />} description="MACD / Signal / Hist" valueClassName="text-xs leading-tight"/>
            </CardContent>
          </Card>
         
          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">Recent Averages (5P)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <StatCard title="Avg Price" value={recentAverages.averagePrice} icon={<HelpCircle />} />
                <StatCard title="Avg Volume" value={recentAverages.averageVolume.toLocaleString(undefined, {notation: 'compact'})} icon={<BarChartBig />} />
            </CardContent>
          </Card>

          {priceSpikes.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl text-primary flex items-center"><AlertTriangle className="mr-2 text-accent h-5 w-5" />Price/Volume Spikes (5P)</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[100px]">
                  <ul className="space-y-1 text-xs">
                    {priceSpikes.map((spike, index) => (
                      <li key={index} className="text-muted-foreground">
                        <strong>{spike.date}:</strong> {spike.description}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total P/L" value={backtestResult.profitLoss} icon={<TrendingUp />} className="md:col-span-1" />
        <StatCard title="Win Rate" value={backtestResult.winRate} unit="%" icon={<Percent />} className="md:col-span-1" />
        <StatCard title="Avg. Trade Length" value={backtestResult.averageTradeLength.toFixed(1)} unit="days" icon={<Clock />} className="md:col-span-1" />
      </div>

      {/* Strategy Description Card - New Row */}
      <div className="grid grid-cols-1 gap-6">
        <StrategyDescriptionCard />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Adjusted lg:col-span-5 as narrativeInsights is currently disabled */}
        <div className="lg:col-span-5"> 
            <TradesTable trades={backtestResult.trades} />
        </div>
        {/* 
          The NarrativeCard section is conditionally rendered based on narrativeInsights.
          If AI insights are re-enabled, this section will reappear.
          The column span for TradesTable would then need to be adjusted back, e.g., lg:col-span-3.
        */}
        {narrativeInsights && (
          <div className="lg:col-span-2">
              <NarrativeCard insights={narrativeInsights} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <CumulativeProfitChart trades={backtestResult.trades} />
      </div>
    </div>
  );
}
