import type { MarketData, ChartDataPoint, HistoricalData } from '@/lib/types';
import { MainChart } from './MainChart';
import { StatCard } from './StatCard';
import { TradesTable } from './TradesTable';
import { NarrativeCard } from './NarrativeCard';
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
  }));

  // Add trade markers to chartData
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


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - takes 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <MainChart data={chartData} symbol={symbol} />
        </div>

        {/* Sidebar with Stats - takes 1/3 width */}
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

      {/* Backtest Results and Narrative Insights - Full Width Below */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total P/L" value={backtestResult.profitLoss} icon={<TrendingUp />} className="md:col-span-1" />
        <StatCard title="Win Rate" value={backtestResult.winRate} unit="%" icon={<Percent />} className="md:col-span-1" />
        <StatCard title="Avg. Trade Length" value={backtestResult.averageTradeLength.toFixed(1)} unit="days" icon={<Clock />} className="md:col-span-1" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
            <TradesTable trades={backtestResult.trades} />
        </div>
        <div className="lg:col-span-2">
            <NarrativeCard insights={narrativeInsights} />
        </div>
      </div>
    </div>
  );
}
