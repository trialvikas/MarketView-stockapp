
'use client';

import type { Trade } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { format } from 'date-fns';

type CumulativeProfitChartProps = {
  trades: Trade[];
};

type ProfitChartDataPoint = {
  date: string;
  cumulativeProfit: number;
};

const chartConfig = {
  cumulativeProfit: {
    label: 'Cumulative P/L',
    color: 'hsl(var(--chart-1))', // Green for profit, can use a gradient too
  },
};

// Define a gradient for the Area chart
const gradientId = "profitGradient";

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload as ProfitChartDataPoint;
    return (
      <div className="p-2 bg-card border border-border rounded-md shadow-lg text-sm">
        <p className="font-headline">{format(new Date(entry.date), 'MMM dd, yyyy')}</p>
        <p style={{ color: chartConfig.cumulativeProfit.color }}>
          {chartConfig.cumulativeProfit.label}: {entry.cumulativeProfit.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
        </p>
      </div>
    );
  }
  return null;
};

export function CumulativeProfitChart({ trades }: CumulativeProfitChartProps) {
  const closedTrades = trades.filter(trade => !trade.isOpen && trade.exitDate && trade.profit !== undefined);
  closedTrades.sort((a, b) => new Date(a.exitDate!).getTime() - new Date(b.exitDate!).getTime());

  let runningProfit = 0;
  const profitData: ProfitChartDataPoint[] = closedTrades.map(trade => {
    runningProfit += trade.profit!;
    return {
      date: trade.exitDate!,
      cumulativeProfit: runningProfit,
    };
  });

  if (profitData.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary">Cumulative Profit Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p>No trade data available to display cumulative profit.</p>
        </CardContent>
      </Card>
    );
  }

  // Determine min/max for gradient stops based on profit values
  const profits = profitData.map(p => p.cumulativeProfit);
  const minProfit = Math.min(0, ...profits); // Ensure 0 is included for the gradient base
  const maxProfit = Math.max(0, ...profits);

  const getGradientOffset = () => {
    if (minProfit >= 0) return "0%"; // All positive or zero
    if (maxProfit <= 0) return "100%"; // All negative or zero
    // Mix of positive and negative
    const range = maxProfit - minProfit;
    if (range === 0) return "50%"; // all zero or single point
    return `${(maxProfit / range) * 100}%`;
  };
  const offset = getGradientOffset();


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary">Cumulative Profit Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] p-0">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={profitData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset={offset} stopColor="hsl(var(--chart-2))" stopOpacity={0.4}/> {/* Greenish for profit */}
                  <stop offset={offset} stopColor="hsl(0, 70%, 50%)" stopOpacity={0.4}/> {/* Reddish for loss */}
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(tick) => format(new Date(tick), 'MMM yy')}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `$${value.toLocaleString(undefined, {notation: 'compact', compactDisplay: 'short'})}`}
                tick={{ fontSize: 10 }}
                domain={['auto', 'auto']}
              />
              <ChartTooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1 }} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area 
                type="monotone" 
                dataKey="cumulativeProfit" 
                stroke={chartConfig.cumulativeProfit.color} 
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                strokeWidth={2}
                name={chartConfig.cumulativeProfit.label} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
