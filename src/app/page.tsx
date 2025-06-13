'use client';

import { useState, useEffect, useTransition } from 'react';
import { Logo } from '@/components/icons/Logo';
import { StockInputForm } from '@/components/dashboard/StockInputForm';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { getMarketData } from '@/actions/market-data';
import type { MarketData } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function MarketViewPage() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, startTransition] = useTransition();
  const { toast } = useToast();
  const [currentSymbol, setCurrentSymbol] = useState<string | null>(null);

  const handleAnalyzeStock = (symbol: string) => {
    setError(null);
    setMarketData(null);
    setCurrentSymbol(symbol);

    startTransition(async () => {
      toast({
        title: "Fetching Data",
        description: `Analyzing ${symbol}... This may take a moment.`,
        variant: "default",
      });
      const result = await getMarketData(symbol);
      if ('error' in result) {
        setError(result.error);
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        setMarketData(result);
         toast({
          title: "Analysis Complete",
          description: `Successfully analyzed ${symbol}.`,
          variant: "default", // Success variant could be added to ShadCN theme
        });
      }
    });
  };
  
  // Analyze default stock on initial load
  useEffect(() => {
    handleAnalyzeStock('AAPL');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-primary">MarketView</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <StockInputForm onSubmit={handleAnalyzeStock} isProcessing={isProcessing} />

        {isProcessing && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Skeleton className="h-[500px] w-full rounded-lg" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-[200px] w-full rounded-lg" />
                    <Skeleton className="h-[150px] w-full rounded-lg" />
                    <Skeleton className="h-[150px] w-full rounded-lg" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-[100px] w-full rounded-lg" />
                <Skeleton className="h-[100px] w-full rounded-lg" />
                <Skeleton className="h-[100px] w-full rounded-lg" />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3"><Skeleton className="h-[300px] w-full rounded-lg" /></div>
                <div className="lg:col-span-2"><Skeleton className="h-[300px] w-full rounded-lg" /></div>
            </div>
          </div>
        )}

        {error && !isProcessing && (
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-headline">Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isProcessing && !error && !marketData && currentSymbol && (
           <Alert variant="default" className="max-w-2xl mx-auto">
            <Info className="h-5 w-5" />
            <AlertTitle className="font-headline">Ready to Analyze</AlertTitle>
            <AlertDescription>Enter a stock symbol and click "Analyze" to see results.</AlertDescription>
          </Alert>
        )}
        
        {marketData && !isProcessing && (
          <DashboardContent data={marketData} />
        )}
      </main>

      <footer className="p-4 border-t border-border text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MarketView. Data provided for informational purposes only.</p>
      </footer>
    </div>
  );
}
