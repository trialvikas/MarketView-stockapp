
'use client';

import type { ChartDataPoint } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, ReferenceDot, TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { format } from 'date-fns';

type MainChartProps = {
  data: ChartDataPoint[];
  symbol: string;
};

const chartConfig = {
  price: { label: 'Price', color: 'hsl(var(--chart-1))' },
  vwma20: { label: 'VWMA 20', color: 'hsl(var(--chart-2))' },
  ema50: { label: 'EMA 50', color: 'hsl(var(--chart-3))' },
  ema200: { label: 'EMA 200', color: 'hsl(var(--chart-4))' },
  buy: { label: 'Buy', color: 'hsl(120, 70%, 50%)' },
  sell: { label: 'Sell', color: 'hsl(0, 70%, 50%)' },
  spike: { label: 'Spike Event', color: 'hsl(var(--accent))' }, // Color for spike events
};

export function MainChart({ data, symbol }: MainChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <CardContent>
          <p>No chart data available.</p>
        </CardContent>
      </Card>
    );
  }
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload as ChartDataPoint; // Cast to get custom properties
      return (
        <div className="p-2 bg-card border border-border rounded-md shadow-lg text-sm">
          <p className="font-headline">{format(new Date(entry.date), 'MMM dd, yyyy')}</p>
          {payload.map((pld, index) => (
             <p key={index} style={{ color: pld.color as string }}>
                {`${pld.name}: ${typeof pld.value === 'number' ? pld.value.toFixed(2) : pld.value}`}
             </p>
          ))}
          {entry.open && <p>O: {entry.open.toFixed(2)}</p>}
          {entry.high && <p>H: {entry.high.toFixed(2)}</p>}
          {entry.low && <p>L: {entry.low.toFixed(2)}</p>}
          {entry.volume && <p>Vol: {entry.volume.toLocaleString()}</p>}
          {entry.hasSpike && entry.spikeDescriptions && entry.spikeDescriptions.length > 0 && (
            <div className="mt-1 pt-1 border-t border-border/50">
              <p className="font-semibold" style={{ color: chartConfig.spike.color }}>Spike Events:</p>
              <ul className="list-disc list-inside text-xs pl-2">
                {entry.spikeDescriptions.map((desc, i) => <li key={`spike-desc-${i}`}>{desc}</li>)}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">{symbol} Price Chart</CardTitle>
      </CardHeader>
      <CardContent className="h-[500px] p-0">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(tick) => format(new Date(tick), 'MMM yy')}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                yAxisId="left"
                orientation="left" 
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1 }}/>
              <ChartLegend content={<ChartLegendContent />} />
              
              <Line yAxisId="left" type="monotone" dataKey="price" stroke={chartConfig.price.color} strokeWidth={2} dot={false} name="Price" />
              <Line yAxisId="left" type="monotone" dataKey="vwma20" stroke={chartConfig.vwma20.color} strokeWidth={1.5} dot={false} name="VWMA 20" />
              <Line yAxisId="left" type="monotone" dataKey="ema50" stroke={chartConfig.ema50.color} strokeWidth={1.5} dot={false} name="EMA 50" />
              <Line yAxisId="left" type="monotone" dataKey="ema200" stroke={chartConfig.ema200.color} strokeWidth={1.5} dot={false} name="EMA 200" />

              {data.map((entry, index) => {
                let dots = [];
                if (entry.trade === 'buy') {
                  dots.push(<ReferenceDot key={`buy-${index}`} x={entry.date} y={entry.price} r={5} fill={chartConfig.buy.color} stroke="none" yAxisId="left" ifOverflow="extendDomain" />);
                }
                if (entry.trade === 'sell') {
                  dots.push(<ReferenceDot key={`sell-${index}`} x={entry.date} y={entry.price} r={5} fill={chartConfig.sell.color} stroke="none" yAxisId="left" ifOverflow="extendDomain" />);
                }
                if (entry.hasSpike) {
                   // Offset spike dot slightly if trade dot is also present to avoid complete overlap
                  const yOffset = entry.trade ? entry.price * 0.01 : 0; // Example: 1% offset
                  dots.push(<ReferenceDot key={`spike-${index}`} x={entry.date} y={entry.price - yOffset} r={7} fill={chartConfig.spike.color} fillOpacity={0.7} stroke="white" strokeWidth={1} yAxisId="left" ifOverflow="extendDomain" />);
                }
                return dots;
              })}

            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
