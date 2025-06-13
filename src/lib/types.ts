
export interface HistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

export interface CalculatedIndicators {
  rsi14: number[];
  macd: Array<{ macd: number; signal: number; histogram: number } | undefined>;
  ema200: number[];
  vwma20: number[];
  ema50: number[];
}

export interface RecentAverages {
  averagePrice: number;
  averageVolume: number;
}

export interface PriceSpike {
  date: string; // YYYY-MM-DD
  description: string;
  // Future enhancement: type: 'volume' | 'price_increase' | 'price_decrease';
  // Future enhancement: rawValue?: number;
  // Future enhancement: avgValue?: number;
}

export interface Trade {
  entryDate: string;
  entryPrice: number;
  exitDate?: string;
  exitPrice?: number;
  profit?: number;
  profitPercentage?: number;
  tradeLength?: number; // in days
  isOpen: boolean;
}

export interface BacktestResult {
  trades: Trade[];
  profitLoss: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageTradeLength: number; // in days
  averageWin?: number;
  averageLoss?: number;
  maxDrawdown?: number; // Placeholder, calculation can be complex
}

export interface MarketData {
  symbol: string;
  historicalData: HistoricalData[];
  indicators: CalculatedIndicators;
  recentAverages: RecentAverages;
  priceSpikes: PriceSpike[];
  backtestResult: BacktestResult;
  narrativeInsights?: string; // Made optional
}

export interface ChartDataPoint {
  date: string;
  price: number; // close price
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  vwma20?: number;
  ema50?: number;
  ema200?: number;
  rsi?: number; // For potential RSI chart
  trade?: 'buy' | 'sell'; // Mark trades
  hasSpike?: boolean;
  spikeDescriptions?: string[];
}
