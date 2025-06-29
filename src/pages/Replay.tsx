import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import PortfolioChart from "@/components/PortfolioChart";
import Timeline from "@/components/Timeline";
import ShareReplayDialog from "@/components/ShareReplayDialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AiTradeSummaryCard from "@/components/AiTradeSummaryCard";
import { extractTradeData } from "@/utils/tradeDataExtractor";

interface PortfolioData {
  walletAddress: string;
  network?: string;
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

const Replay = () => {
  const { address } = useParams();
  const [searchParams] = useSearchParams();
  const network = searchParams.get('network') || 'mainnet';
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view portfolio replays.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [user, loading, navigate, toast]);

  // Fetch real portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!address) return;

      try {
        console.log(`Fetching portfolio data for replay: ${address} on ${network}`);
        
        const { data, error } = await supabase.functions.invoke('fetch-sei-portfolio', {
          body: { walletAddress: address, network }
        });

        if (error) {
          console.error("Error fetching portfolio:", error);
          toast({
            title: "Error loading portfolio",
            description: "Failed to load portfolio data for replay",
            variant: "destructive",
          });
          return;
        }

        setPortfolioData(data);
      } catch (error: any) {
        console.error("Error fetching portfolio:", error);
        toast({
          title: "Error loading portfolio",
          description: `Failed to connect to Sei ${network}`,
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    if (address) {
      fetchPortfolioData();
    }
  }, [address, network, toast]);

  const maxSteps = portfolioData?.chartData.length || 0;

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < maxSteps - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000 / speed);
    } else if (currentStep >= maxSteps - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, maxSteps, speed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading portfolio data from Sei blockchain...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  if (!portfolioData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Failed to Load Portfolio</h1>
          <p className="text-slate-600 mb-4">Unable to fetch data for this wallet address.</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentData = portfolioData.chartData.slice(0, currentStep + 1);
  const currentEvent = portfolioData.timeline[currentStep];
  const tradeData = extractTradeData(portfolioData);
  const networkDisplay = portfolioData.network ? portfolioData.network.toUpperCase() : network.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">Portfolio Replay</h1>
            <p className="text-slate-600">Wallet: {address?.slice(0, 8)}...{address?.slice(-6)}</p>
            <p className="text-sm text-slate-500">🌐 Sei {networkDisplay} Data</p>
          </div>
          <ShareReplayDialog walletAddress={address || ""} />
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800">
              Portfolio Value: ${currentData[currentData.length - 1]?.value.toFixed(2) || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioChart data={currentData} animated={true} />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800">Replay Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handlePlayPause}
                  className="flex items-center gap-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Speed: {speed}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Progress: {currentStep + 1} / {maxSteps}
                </label>
                <input
                  type="range"
                  min="0"
                  max={maxSteps - 1}
                  value={currentStep}
                  onChange={(e) => setCurrentStep(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800">Current Event</CardTitle>
            </CardHeader>
            <CardContent>
              {currentEvent ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentEvent.icon}</span>
                    <span className="font-semibold text-slate-800">{currentEvent.action}</span>
                  </div>
                  <p className="text-slate-600">{currentEvent.description}</p>
                  <p className="text-sm text-slate-500">{currentEvent.date}</p>
                </div>
              ) : (
                <p className="text-slate-500">No event data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Timeline 
          events={portfolioData.timeline} 
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />

        {/* AI Trade Summary Card */}
        <AiTradeSummaryCard tradeData={tradeData} />
      </div>
    </div>
  );
};

export default Replay;
