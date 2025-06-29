
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TradeData {
  totalTrades: number;
  volumeUSD: number;
  netGainLossPercent: number;
  bestToken: string;
  worstToken: string;
  tradingBehavior: string;
}

interface AiTradeSummaryCardProps {
  tradeData: TradeData;
}

const AiTradeSummaryCard = ({ tradeData }: AiTradeSummaryCardProps) => {
  const [summary, setSummary] = useState<string>("");
  const [mood, setMood] = useState<any>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingMood, setIsLoadingMood] = useState(false);
  const { toast } = useToast();

  const generateSummary = async () => {
    if (isLoadingSummary) return;
    
    setIsLoadingSummary(true);
    console.log("Generating trade summary...");
    
    try {
      const { data, error } = await supabase.functions.invoke('get-trade-summary', {
        body: { tradeData, type: 'summary' }
      });

      if (error) throw error;
      setSummary(data.content);
      
      toast({
        title: "Analysis Complete",
        description: "Trade summary has been generated successfully.",
      });
    } catch (error: any) {
      console.error("Error generating summary:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate trade summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const generateMood = async () => {
    if (isLoadingMood) return;
    
    setIsLoadingMood(true);
    console.log("Generating mood data...");
    
    try {
      const { data, error } = await supabase.functions.invoke('get-trade-summary', {
        body: { tradeData, type: 'mood' }
      });

      if (error) throw error;
      setMood(data.content);
      
      toast({
        title: "Mood Analysis Complete",
        description: "Trading mood has been analyzed successfully.",
      });
    } catch (error: any) {
      console.error("Error generating mood:", error);
      toast({
        title: "Mood Analysis Failed",
        description: "Failed to analyze trading mood. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMood(false);
    }
  };

  const getMoodColor = (colorTheme: string) => {
    switch (colorTheme) {
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      case 'red': return 'text-red-600 bg-red-50 border-red-200';
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'purple': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'orange': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  console.log("AiTradeSummaryCard rendering with tradeData:", tradeData);

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          AI Trade Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trading Summary Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-700">Trading Summary</h4>
            <Button
              onClick={generateSummary}
              disabled={isLoadingSummary}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isLoadingSummary ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              {isLoadingSummary ? "Analyzing..." : "Generate Analysis"}
            </Button>
          </div>
          
          {summary && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-700 leading-relaxed">{summary}</p>
            </div>
          )}
        </div>

        {/* Trading Mood Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-700">Trading Mood</h4>
            <Button
              onClick={generateMood}
              disabled={isLoadingMood}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isLoadingMood ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isLoadingMood ? "Analyzing..." : "Generate Mood"}
            </Button>
          </div>
          
          {mood && (
            <div className={`p-4 rounded-lg border-2 ${getMoodColor(mood.color_theme)}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{mood.emoji}</span>
                <div>
                  <h5 className="font-bold text-lg">{mood.theme_name}</h5>
                  <p className="text-sm opacity-80">{mood.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AiTradeSummaryCard;
