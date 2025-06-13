import type { Trade } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

type TradesTableProps = {
  trades: Trade[];
};

export function TradesTable({ trades }: TradesTableProps) {
  if (!trades || trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary">Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No trades executed.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary">Trade Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entry Date</TableHead>
                <TableHead>Entry Price</TableHead>
                <TableHead>Exit Date</TableHead>
                <TableHead>Exit Price</TableHead>
                <TableHead className="text-right">P/L</TableHead>
                <TableHead className="text-right">P/L %</TableHead>
                <TableHead className="text-right">Length</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade, index) => (
                <TableRow key={index} className={trade.isOpen ? 'opacity-60' : ''}>
                  <TableCell>{trade.entryDate}</TableCell>
                  <TableCell>${trade.entryPrice.toFixed(2)}</TableCell>
                  <TableCell>{trade.exitDate || (trade.isOpen ? 'Open' : 'N/A')}</TableCell>
                  <TableCell>{trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : (trade.isOpen ? '-' : 'N/A')}</TableCell>
                  <TableCell className={`text-right font-mono ${trade.profit && trade.profit > 0 ? 'text-green-400' : trade.profit && trade.profit < 0 ? 'text-red-400' : ''}`}>
                    {trade.profit !== undefined ? (
                       <>
                        {trade.profit > 0 && <ArrowUpRight className="inline h-4 w-4 mr-1" />}
                        {trade.profit < 0 && <ArrowDownRight className="inline h-4 w-4 mr-1" />}
                        ${trade.profit.toFixed(2)}
                       </>
                    ) : (trade.isOpen ? '-' : 'N/A')}
                  </TableCell>
                   <TableCell className={`text-right font-mono ${trade.profitPercentage && trade.profitPercentage > 0 ? 'text-green-400' : trade.profitPercentage && trade.profitPercentage < 0 ? 'text-red-400' : ''}`}>
                    {trade.profitPercentage !== undefined ? `${trade.profitPercentage.toFixed(2)}%` : (trade.isOpen ? '-' : 'N/A')}
                  </TableCell>
                  <TableCell className="text-right">{trade.tradeLength !== undefined ? `${trade.tradeLength}d` : (trade.isOpen ? '-' : 'N/A')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
