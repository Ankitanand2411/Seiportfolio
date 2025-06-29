
export const mockPortfolioData = {
  chartData: [
    { date: '2024-01-01', value: 10000 },
    { date: '2024-01-05', value: 12500 },
    { date: '2024-01-10', value: 11800 },
    { date: '2024-01-15', value: 15200 },
    { date: '2024-01-20', value: 13900 },
    { date: '2024-01-25', value: 18500 },
    { date: '2024-01-30', value: 16800 },
    { date: '2024-02-05', value: 22100 },
    { date: '2024-02-10', value: 19800 },
    { date: '2024-02-15', value: 25600 },
    { date: '2024-02-20', value: 23200 },
    { date: '2024-02-25', value: 28900 },
  ],
  summary: {
    bestTrade: {
      token: 'SEI',
      gain: 8500,
      percentage: 340.2
    },
    worstTrade: {
      token: 'DOGE',
      loss: -2300,
      percentage: -45.8
    },
    totalGainLoss: {
      amount: 18900,
      percentage: 189.0
    }
  },
  timeline: [
    {
      date: '2024-01-01',
      action: 'Initial Deposit',
      description: 'Deposited $10,000 to start trading',
      icon: '💰'
    },
    {
      date: '2024-01-05',
      action: 'Bought SEI',
      description: 'Purchased 5,000 SEI tokens at $0.50',
      icon: '📈'
    },
    {
      date: '2024-01-10',
      action: 'Sold ATOM',
      description: 'Sold 100 ATOM tokens for $700 loss',
      icon: '📉'
    },
    {
      date: '2024-01-15',
      action: 'SEI Pump',
      description: 'SEI price increased 60% overnight',
      icon: '🚀'
    },
    {
      date: '2024-01-20',
      action: 'Portfolio Rebalance',
      description: 'Took profits and diversified holdings',
      icon: '⚖️'
    },
    {
      date: '2024-01-25',
      action: 'NFT Purchase',
      description: 'Bought Sei Punks NFT for 500 SEI',
      icon: '🖼️'
    },
    {
      date: '2024-01-30',
      action: 'Market Correction',
      description: 'Overall market declined by 15%',
      icon: '📊'
    },
    {
      date: '2024-02-05',
      action: 'DeFi Staking',
      description: 'Started staking rewards earning 12% APY',
      icon: '🔒'
    },
    {
      date: '2024-02-10',
      action: 'DOGE Investment',
      description: 'FOMO bought DOGE at local top',
      icon: '🐕'
    },
    {
      date: '2024-02-15',
      action: 'Airdrop Received',
      description: 'Received 1,000 tokens from protocol airdrop',
      icon: '🎁'
    },
    {
      date: '2024-02-20',
      action: 'Profit Taking',
      description: 'Sold 30% of holdings for stable coins',
      icon: '💵'
    },
    {
      date: '2024-02-25',
      action: 'All Time High',
      description: 'Portfolio reached new all-time high',
      icon: '🏆'
    }
  ]
};
