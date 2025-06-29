
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye } from "lucide-react";
import PortfolioChart from "@/components/PortfolioChart";
import Timeline from "@/components/Timeline";
import { mockPortfolioData } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SharedReplayData {
  id: string;
  wallet_address: string;
  title: string;
  description: string;
  view_count: number;
  created_at: string;
}

const SharedReplay = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [replayData, setReplayData] = useState<SharedReplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const portfolioData = mockPortfolioData;
  const maxSteps = portfolioData.chartData.length;

  useEffect(() => {
    if (id) {
      fetchReplayData();
      incrementViewCount();
    }
  }, [id]);

  const fetchReplayData = async () => {
    try {
      const { data, error } = await supabase
        .from("shared_replays")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setReplayData(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load shared replay.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc("increment_replay_views", { replay_id: id });
    } catch (error) {
      console.error("Failed to increment view count:", error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < maxSteps - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000);
    } else if (currentStep >= maxSteps - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, maxSteps]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading shared replay...</p>
        </div>
      </div>
    );
  }

  if (!replayData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Replay Not Found</h1>
          <p className="text-slate-600 mb-4">The shared replay you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentData = portfolioData.chartData.slice(0, currentStep + 1);
  const currentEvent = portfolioData.timeline[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">{replayData.title}</h1>
            <p className="text-slate-600">Wallet: {replayData.wallet_address.slice(0, 8)}...{replayData.wallet_address.slice(-6)}</p>
            {replayData.description && (
              <p className="text-slate-600 mt-1">{replayData.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Eye className="w-4 h-4" />
            <span>{replayData.view_count} views</span>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800">
              Portfolio Value: ${currentData[currentData.length - 1]?.value.toLocaleString() || 0}
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
                <Button onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button onClick={() => setCurrentStep(0)} variant="outline">
                  Reset
                </Button>
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
      </div>
    </div>
  );
};

export default SharedReplay;
