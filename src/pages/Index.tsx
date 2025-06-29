
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/HeroSection";
import StatsCards from "@/components/StatsCards";
import WalletInput from "@/components/WalletInput";
import PortfolioDisplay from "@/components/PortfolioDisplay";
import ReplayButton from "@/components/ReplayButton";

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

const Index = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("mainnet");
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFetchPortfolio = async () => {
    if (!walletAddress) {
      toast({
        title: "Please enter a wallet address",
        variant: "destructive",
      });
      return;
    }

    // Validate Sei wallet address format
    if (!walletAddress.startsWith("sei1") || walletAddress.length !== 42) {
      toast({
        title: "Invalid Sei wallet address",
        description: "Please enter a valid Sei wallet address (starts with 'sei1' and is 42 characters long)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log(`Fetching real Sei ${network} data for:`, walletAddress);
      
      const { data, error } = await supabase.functions.invoke('fetch-sei-portfolio', {
        body: { walletAddress, network }
      });

      if (error) {
        console.error("Error fetching portfolio:", error);
        toast({
          title: "Error fetching portfolio",
          description: error.message || `Failed to fetch portfolio data from Sei ${network}`,
          variant: "destructive",
        });
        return;
      }

      console.log(`Real Sei ${network} data received:`, data);
      setPortfolioData(data);
      
      toast({
        title: "Real portfolio data loaded!",
        description: `Fetched live data from Sei ${network} for ${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`,
      });
    } catch (error: any) {
      console.error("Error fetching portfolio:", error);
      toast({
        title: "Error fetching portfolio",
        description: `Failed to connect to Sei ${network}. Please check the wallet address and try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartReplay = () => {
    if (!walletAddress) {
      toast({
        title: "Please enter a wallet address first",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Please sign in to use replay feature",
        description: "Authentication is required to create and view replays.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    navigate(`/replay/${walletAddress}?network=${network}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        <HeroSection />
        <StatsCards />
        <WalletInput 
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          network={network}
          setNetwork={setNetwork}
          handleFetchPortfolio={handleFetchPortfolio}
          isLoading={isLoading}
          user={user}
        />
        {portfolioData && <PortfolioDisplay portfolioData={portfolioData} />}
        <ReplayButton onClick={handleStartReplay} disabled={!portfolioData} />
      </div>
    </div>
  );
};

export default Index;
