
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

export function StrategyDescriptionCard() {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center space-x-2">
        <Info className="h-5 w-5 text-accent" />
        <CardTitle className="font-headline text-xl text-primary">Backtesting Strategy</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-foreground/90 space-y-2">
        <p>The backtest results are based on the following VWMA/EMA crossover strategy:</p>
        <ul className="list-disc list-outside pl-5 space-y-1">
          <li>
            <strong>Entry Signal:</strong> The 20-period Volume Weighted Moving Average (VWMA) crosses <span className="text-green-400">above</span> the 50-period Exponential Moving Average (EMA).
          </li>
          <li>
            <strong>Exit Signal:</strong> The entire price candle closes <span className="text-red-400">below</span> the 20-period VWMA, AND the 20-period VWMA is also <span className="text-red-400">below</span> the 50-period EMA.
          </li>
        </ul>
        <p className="text-xs text-muted-foreground pt-2">
          Note: "Entire candle closes below" is interpreted as the day's high price being less than the VWMA value. This is a simplified strategy for demonstration purposes.
        </p>
      </CardContent>
    </Card>
  );
}
