// use server'
'use server';

/**
 * @fileOverview Generates narrative insights based on backtest results.
 *
 * - generateNarrativeInsights - A function that generates narrative insights.
 * - GenerateNarrativeInsightsInput - The input type for the generateNarrativeInsights function.
 * - GenerateNarrativeInsightsOutput - The return type for the generateNarrativeInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNarrativeInsightsInputSchema = z.object({
  profitLoss: z.number().describe('The profit or loss of the backtest.'),
  winRate: z.number().describe('The win rate of the backtest (0 to 1).'),
  entryPoints: z.number().describe('The number of entry points in the backtest.'),
  exitPoints: z.number().describe('The number of exit points in the backtest.'),
  averageTradeLength: z.number().describe('The average length of a trade in periods.'),
  stockSymbol: z.string().describe('The stock symbol used in the backtest.'),
  rsiValues: z.array(z.number()).describe('RSI values during the backtest period.'),
  macdValues: z.array(z.number()).describe('MACD values during the backtest period.'),
  ema200Values: z.array(z.number()).describe('200 EMA values during the backtest period.'),
  vwmaValues: z.array(z.number()).describe('VWMA values during the backtest period.'),
  ema50Values: z.array(z.number()).describe('50 EMA values during the backtest period.'),
  recentPriceVolumeAverages: z
    .object({
      averagePrice: z.number(),
      averageVolume: z.number(),
    })
    .describe('Average price and volume over the recent period.'),
  volumePriceSpikes: z
    .array(z.string())
    .describe('Description of significant volume/price spikes.'),
});

export type GenerateNarrativeInsightsInput = z.infer<
  typeof GenerateNarrativeInsightsInputSchema
>;

const GenerateNarrativeInsightsOutputSchema = z.object({
  narrative: z.string().describe('AI-generated narrative insights.'),
});

export type GenerateNarrativeInsightsOutput = z.infer<
  typeof GenerateNarrativeInsightsOutputSchema
>;

export async function generateNarrativeInsights(
  input: GenerateNarrativeInsightsInput
): Promise<GenerateNarrativeInsightsOutput> {
  return generateNarrativeInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'narrativeInsightsPrompt',
  input: {schema: GenerateNarrativeInsightsInputSchema},
  output: {schema: GenerateNarrativeInsightsOutputSchema},
  prompt: `You are an AI assistant that analyzes stock trading backtest results and provides narrative insights.

  Given the following backtest results, generate a concise narrative summary of the key trends and potential price action.
  Include insights about profitability, win rate, and any notable events like volume/price spikes.

  Backtest Results:
  - Stock Symbol: {{{stockSymbol}}}
  - Profit/Loss: {{{profitLoss}}}
  - Win Rate: {{{winRate}}}
  - Entry Points: {{{entryPoints}}}
  - Exit Points: {{{exitPoints}}}
  - Average Trade Length: {{{averageTradeLength}}}
  - Recent Average Price: {{{recentPriceVolumeAverages.averagePrice}}}
  - Recent Average Volume: {{{recentPriceVolumeAverages.averageVolume}}}

  - Volume/Price Spikes: {{#each volumePriceSpikes}}{{{this}}}\n{{/each}}

  RSI Values: {{#each rsiValues}}{{{this}}} {{/each}}
  MACD Values: {{#each macdValues}}{{{this}}} {{/each}}
  200 EMA Values: {{#each ema200Values}}{{{this}}} {{/each}}
  VWMA Values: {{#each vwmaValues}}{{{this}}} {{/each}}
  50 EMA Values: {{#each ema50Values}}{{{this}}} {{/each}}
  \n
  Narrative Insights:
  `,
});

const generateNarrativeInsightsFlow = ai.defineFlow(
  {
    name: 'generateNarrativeInsightsFlow',
    inputSchema: GenerateNarrativeInsightsInputSchema,
    outputSchema: GenerateNarrativeInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
