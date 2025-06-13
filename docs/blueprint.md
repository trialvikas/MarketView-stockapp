# **App Name**: MarketView

## Core Features:

- Data Acquisition: Fetches historical stock data (15 years) from Yahoo Finance and stores it in memory for analysis. Please be aware that, due to the limitations of the stack being proposed, the data will need to be fetched again each time the application is loaded. Includes the OHLCV data as well as calculated indicators
- Indicator Calculation: Calculates technical indicators: 14-period RSI, MACD, 200 EMA, 20-period VWMA, 50-period EMA, and the average price and volume for the last 5 periods.
- Strategy Implementation: Implements the specified trading strategy: Buy when 20 VWMA crosses above 50 EMA; sell when a full candle closes below 20 VWMA and VWMA is below 50 EMA.
- Spike Detection: Analyzes historical data to identify volume/price spikes in the last 5 periods, providing key insight.
- AI-Powered Insights: Uses a generative AI tool to create narrative insights based on the backtest results. These narrative snippets can give the user quick context and explain what the system believes may be significant price action. These results may be presented along side numerical calculations.
- Dashboard Display: Presents a dashboard view of the calculated indicator values (RSI, MACD, EMA, VWMA), recent price/volume averages, and identified volume/price spikes, along with entry and exit points of the implemented trading strategy. Clear visual aids should call out the data for backtesting.
- Backtest Results Display: Displays the historical performance (profit/loss, win rate, etc.) of the trading strategy on the selected stock and date range.

## Style Guidelines:

- Primary color: Forest green (#34A04A) to evoke growth and financial health.
- Background color: Dark grey (#222222) for a modern, sophisticated look.
- Accent color: Electric blue (#7DF9FF) to highlight key data points and interactive elements.
- Headline font: 'Space Grotesk' (sans-serif) for a techy, scientific feel.
- Body font: 'Inter' (sans-serif) to pair with 'Space Grotesk'. Use 'Space Grotesk' for the occasional emphasized text if needed.
- Code font: 'Source Code Pro' for displaying any code snippets.
- Use simple, clean icons to represent different metrics and indicators. Color-code these icons to match the accent color and create visual consistency.
- A well-organized dashboard layout with clear sections for data, indicators, and strategy results. Use grid system for responsiveness.
- Subtle transitions and animations when displaying new data or updating charts.