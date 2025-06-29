
interface PortfolioData {
  walletAddress: string;
  chartData: Array<{
    date: string;
    value: number;
  }>;
  timeline: Array<{
    date: string;
    action: string;
    description: string;
    icon: string;
  }>;
  summary: {
    bestTrade: {
      token: string;
      gain: number;
      percentage: number;
    };
    worstTrade: {
      token: string;
      loss: number;
      percentage: number;
    };
    totalGainLoss: {
      amount: number;
      percentage: number;
    };
  };
}

interface TradeData {
  totalTrades: number;
  volumeUSD: number;
  netGainLossPercent: number;
  bestToken: string;
  worstToken: string;
  tradingBehavior: string;
}

export const extractTradeData = (portfolioData: PortfolioData): TradeData => {
  const totalTrades = portfolioData.timeline.length;
  const chartValues = portfolioData.chartData.map(d => d.value);
  const maxValue = Math.max(...chartValues);
  const minValue = Math.min(...chartValues);
  const volumeUSD = maxValue; // Approximate volume based on portfolio value
  
  const netGainLossPercent = portfolioData.summary.totalGainLoss.percentage;
  const bestToken = portfolioData.summary.bestTrade.token || 'SEI';
  const worstToken = portfolioData.summary.worstTrade.token || 'SEI';
  
  // Analyze trading behavior based on timeline and performance
  let tradingBehavior = "Moderate trader";
  if (totalTrades > 20) {
    tradingBehavior = "Active trader";
  } else if (totalTrades < 5) {
    tradingBehavior = "Conservative holder";
  }
  
  if (netGainLossPercent > 20) {
    tradingBehavior += " with strong performance";
  } else if (netGainLossPercent < -10) {
    tradingBehavior += " experiencing losses";
  } else {
    tradingBehavior += " with steady performance";
  }
  
  return {
    totalTrades,
    volumeUSD,
    netGainLossPercent,
    bestToken,
    worstToken,
    tradingBehavior
  };
};
