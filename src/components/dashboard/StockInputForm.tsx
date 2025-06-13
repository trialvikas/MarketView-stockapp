
'use client';

import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(20, "Symbol too long").transform(value => value.toUpperCase()),
});

type StockInputFormProps = {
  onSubmit: (symbol: string) => void;
  isProcessing: boolean;
};

export function StockInputForm({ onSubmit, isProcessing }: StockInputFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: 'AAPL', // Default symbol
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values.symbol);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex gap-4 items-end mb-8 p-4 bg-card rounded-lg shadow">
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel className="text-foreground">Stock Symbol</FormLabel>
              <FormControl>
                <Input placeholder="e.g., AAPL, MSFT" {...field} className="bg-input"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isProcessing} className="min-w-[120px]">
          {isProcessing ? <Loader2 className="animate-spin mr-2" /> : null}
          {isProcessing ? 'Analyzing...' : 'Analyze'}
        </Button>
      </form>
    </Form>
  );
}
