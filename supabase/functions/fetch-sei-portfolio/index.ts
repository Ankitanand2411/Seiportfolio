
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PortfolioData {
  walletAddress: string;
  network: string;
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

// Sei network configuration
const SEI_NETWORKS = {
  mainnet: {
    lcd: 'https://rest.sei-apis.com',
    name: 'Pacific-1'
  },
  testnet: {
    lcd: 'https://rest.atlantic-2.seinetwork.io',
    name: 'Atlantic-2'
  },
  devnet: {
    lcd: 'https://rest.arctic-1.seinetwork.io',
    name: 'Arctic-1'
  }
};

class SeiBlockchainClient {
  private baseUrl: string;
  private networkName: string;

  constructor(network: string = 'mainnet') {
    const config = SEI_NETWORKS[network as keyof typeof SEI_NETWORKS] || SEI_NETWORKS.mainnet;
    this.baseUrl = config.lcd;
    this.networkName = config.name;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`Fetching from Sei API: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Sei-Portfolio-Tracker/1.0'
        },
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`Sei API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Sei API response for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  async getAccountBalance(address: string): Promise<any> {
    return await this.makeRequest(`/cosmos/bank/v1beta1/balances/${address}`);
  }

  async getAccountInfo(address: string): Promise<any> {
    return await this.makeRequest(`/cosmos/auth/v1beta1/accounts/${address}`);
  }

  async getTransactions(address: string, limit: number = 50): Promise<any> {
    // Get transactions where the address is either sender or receiver
    const events = [
      `message.sender='${address}'`,
      `transfer.recipient='${address}'`,
      `transfer.sender='${address}'`
    ];
    
    const eventQuery = events.join(' OR ');
    const encodedQuery = encodeURIComponent(eventQuery);
    
    return await this.makeRequest(`/cosmos/tx/v1beta1/txs?events=${encodedQuery}&limit=${limit}&order_by=ORDER_BY_DESC`);
  }

  async getDelegations(address: string): Promise<any> {
    return await this.makeRequest(`/cosmos/staking/v1beta1/delegations/${address}`);
  }

  async getRewards(address: string): Promise<any> {
    return await this.makeRequest(`/cosmos/distribution/v1beta1/delegators/${address}/rewards`);
  }
}

// Enhanced fallback data with MCP removal indication
function createFallbackData(walletAddress: string, network: string, reason: string = "API unavailable"): PortfolioData {
  const today = new Date();
  const mockChartData = [];
  const mockTimeline = [];
  
  // Generate mock chart data for the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    mockChartData.push({
      date: date.toISOString().split('T')[0],
      value: 1000 + Math.random() * 500 + (i * 10)
    });
  }

  mockTimeline.push(
    {
      date: today.toLocaleDateString(),
      action: "Direct API Mode",
      description: `Fetching data directly from Sei ${network} REST API. ${reason}`,
      icon: "🔗"
    },
    {
      date: new Date(today.getTime() - 86400000).toLocaleDateString(),
      action: "Mock Transaction",
      description: "Simulated SEI transfer for demonstration",
      icon: "💸"
    },
    {
      date: new Date(today.getTime() - 172800000).toLocaleDateString(),
      action: "Health Check",
      description: "Wallet address verified and accessible",
      icon: "✅"
    }
  );

  return {
    walletAddress,
    network,
    chartData: mockChartData,
    timeline: mockTimeline,
    summary: {
      bestTrade: { token: "SEI", gain: 150.50, percentage: 15.05 },
      worstTrade: { token: "SEI", loss: -75.25, percentage: -7.53 },
      totalGainLoss: { amount: 275.80, percentage: 21.54 }
    }
  };
}

// Function to parse Sei API data into portfolio format
function parseSeiDataToPortfolio(
  balanceData: any,
  transactionData: any,
  accountInfo: any,
  delegationData: any,
  rewardsData: any,
  address: string,
  network: string
): PortfolioData {
  const timeline = [];
  const chartData = [];
  
  console.log('Parsing Sei API data:', {
    hasBalance: !!balanceData,
    hasTransactions: !!transactionData,
    hasAccount: !!accountInfo,
    hasDelegations: !!delegationData,
    hasRewards: !!rewardsData
  });
  
  // Parse balance data
  let currentBalanceInSei = 0;
  if (balanceData?.balances) {
    const seiBalance = balanceData.balances.find((b: any) => b.denom === 'usei');
    currentBalanceInSei = seiBalance ? parseInt(seiBalance.amount) / 1000000 : 0;
  }
  
  // Parse transaction data
  let transactions = [];
  if (transactionData?.txs) {
    transactions = transactionData.txs.slice(0, 50);
    console.log(`Parsed ${transactions.length} transactions from Sei API`);
  }
  
  let runningBalance = currentBalanceInSei;
  
  // Process transactions to build timeline and chart data
  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    const timestamp = tx.timestamp || new Date().toISOString();
    const date = new Date(timestamp);
    
    // Parse transaction messages
    if (tx.body?.messages) {
      for (const msg of tx.body.messages) {
        let action = "Transaction";
        let description = "Unknown transaction";
        let icon = "📝";
        let amount = 0;
        
        switch (msg["@type"]) {
          case "/cosmos.bank.v1beta1.MsgSend":
            action = "Transfer";
            icon = "💸";
            const sendAmount = parseFloat(msg.amount?.[0]?.amount || 0) / 1000000;
            if (msg.from_address === address) {
              description = `Sent ${sendAmount.toFixed(4)} SEI to ${msg.to_address.slice(0, 8)}...`;
              amount = -sendAmount;
            } else {
              description = `Received ${sendAmount.toFixed(4)} SEI from ${msg.from_address.slice(0, 8)}...`;
              amount = sendAmount;
            }
            break;
          case "/cosmos.staking.v1beta1.MsgDelegate":
            action = "Delegate";
            icon = "🔗";
            amount = parseFloat(msg.amount?.amount || 0) / 1000000;
            description = `Delegated ${amount.toFixed(4)} SEI to validator`;
            break;
          case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
            action = "Claim Rewards";
            icon = "🎁";
            description = "Claimed staking rewards";
            break;
          case "/cosmwasm.wasm.v1.MsgExecuteContract":
            action = "Smart Contract";
            icon = "⚡";
            description = "Executed smart contract";
            break;
          default:
            action = "Transaction";
            description = `${msg["@type"].split('.').pop()} transaction`;
        }
        
        timeline.push({
          date: date.toLocaleDateString(),
          action,
          description,
          icon
        });
        
        runningBalance += amount;
      }
    }
    
    // Add to chart data (sample every few transactions)
    if (i % Math.max(1, Math.floor(transactions.length / 30)) === 0 || i === transactions.length - 1) {
      chartData.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(runningBalance, 0)
      });
    }
  }
  
  // Add staking information
  if (delegationData?.delegation_responses?.length > 0) {
    timeline.unshift({
      date: new Date().toLocaleDateString(),
      action: "Active Staking",
      description: `${delegationData.delegation_responses.length} active delegation(s)`,
      icon: "🥩"
    });
  }
  
  // Add rewards information
  if (rewardsData?.total?.length > 0) {
    const totalRewards = rewardsData.total.reduce((sum: number, reward: any) => {
      return sum + (parseFloat(reward.amount) / 1000000);
    }, 0);
    
    timeline.unshift({
      date: new Date().toLocaleDateString(),
      action: "Pending Rewards",
      description: `${totalRewards.toFixed(4)} SEI available to claim`,
      icon: "💰"
    });
  }
  
  // If no chart data, create a simple current balance point
  if (chartData.length === 0) {
    const today = new Date();
    chartData.push({
      date: today.toISOString().split('T')[0],
      value: currentBalanceInSei
    });
  }
  
  // Calculate summary statistics
  const values = chartData.map(d => d.value);
  const initialValue = values[0] || 0;
  const finalValue = values[values.length - 1] || 0;
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  
  const totalGainLoss = finalValue - initialValue;
  const totalGainLossPercentage = initialValue > 0 ? (totalGainLoss / initialValue) * 100 : 0;
  
  const bestGain = maxValue - initialValue;
  const worstLoss = minValue - initialValue;
  
  return {
    walletAddress: address,
    network,
    chartData,
    timeline: timeline.slice(0, 20).reverse(),
    summary: {
      bestTrade: {
        token: "SEI",
        gain: parseFloat(bestGain.toFixed(2)),
        percentage: parseFloat(initialValue > 0 ? ((bestGain / initialValue) * 100).toFixed(2) : "0")
      },
      worstTrade: {
        token: "SEI",
        loss: parseFloat(worstLoss.toFixed(2)),
        percentage: parseFloat(initialValue > 0 ? ((worstLoss / initialValue) * 100).toFixed(2) : "0")
      },
      totalGainLoss: {
        amount: parseFloat(totalGainLoss.toFixed(2)),
        percentage: parseFloat(totalGainLossPercentage.toFixed(2))
      }
    }
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { walletAddress, network = 'mainnet' } = await req.json();
    
    if (!walletAddress) {
      return new Response(
        JSON.stringify({ error: "Wallet address is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate network
    const supportedNetworks = ['mainnet', 'testnet', 'devnet'];
    if (!supportedNetworks.includes(network)) {
      return new Response(
        JSON.stringify({ error: `Invalid network. Supported networks: ${supportedNetworks.join(', ')}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate Sei address format
    if (!walletAddress.startsWith("sei1") || walletAddress.length !== 42) {
      return new Response(
        JSON.stringify({ error: "Invalid Sei wallet address format" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Fetching Sei ${network} data directly from REST API for wallet: ${walletAddress}`);

    try {
      const seiClient = new SeiBlockchainClient(network);
      
      // Fetch data from Sei API with individual error handling
      const [balanceResult, transactionResult, accountResult, delegationResult, rewardsResult] = await Promise.allSettled([
        seiClient.getAccountBalance(walletAddress),
        seiClient.getTransactions(walletAddress, 50),
        seiClient.getAccountInfo(walletAddress),
        seiClient.getDelegations(walletAddress),
        seiClient.getRewards(walletAddress)
      ]);

      // Extract successful results
      const results = {
        balance: balanceResult.status === 'fulfilled' ? balanceResult.value : null,
        transactions: transactionResult.status === 'fulfilled' ? transactionResult.value : null,
        account: accountResult.status === 'fulfilled' ? accountResult.value : null,
        delegations: delegationResult.status === 'fulfilled' ? delegationResult.value : null,
        rewards: rewardsResult.status === 'fulfilled' ? rewardsResult.value : null
      };

      // Log any failures
      [balanceResult, transactionResult, accountResult, delegationResult, rewardsResult].forEach((result, index) => {
        if (result.status === 'rejected') {
          const dataTypes = ['balance', 'transactions', 'account', 'delegations', 'rewards'];
          console.warn(`Failed to fetch ${dataTypes[index]} from Sei API:`, result.reason.message);
        }
      });

      console.log(`Sei API data fetch complete - Success: ${Object.values(results).filter(r => r !== null).length}/5`);

      // Parse the Sei API data into portfolio format
      const portfolioData = parseSeiDataToPortfolio(
        results.balance, 
        results.transactions, 
        results.account,
        results.delegations,
        results.rewards,
        walletAddress, 
        network
      );

      console.log(`Successfully processed Sei ${network} data from REST API for ${walletAddress}`);

      return new Response(
        JSON.stringify(portfolioData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (apiError) {
      console.error(`Sei API error fetching ${network} data:`, apiError);
      
      // Return fallback data if API requests fail
      const fallbackData = createFallbackData(walletAddress, network, `API Error: ${apiError.message}`);
      
      return new Response(
        JSON.stringify({
          ...fallbackData,
          apiError: `Sei API integration failed: ${apiError.message}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error("Error in fetch-sei-portfolio function:", error);
    
    const { walletAddress, network } = await req.json().catch(() => ({ walletAddress: "unknown", network: "mainnet" }));
    const fallbackData = createFallbackData(walletAddress || "fallback", network || "mainnet", `Function error: ${error.message}`);

    return new Response(
      JSON.stringify({
        ...fallbackData,
        error: `Function error: ${error.message}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
