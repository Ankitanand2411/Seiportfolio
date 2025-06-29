
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, TrendingUp, Zap, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PortfolioChart from "@/components/PortfolioChart";
import PortfolioSummary from "@/components/PortfolioSummary";
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

interface PortfolioDisplayProps {
  portfolioData: PortfolioData;
}

const PortfolioDisplay = ({ portfolioData }: PortfolioDisplayProps) => {
  const tradeData = extractTradeData(portfolioData);
  const networkDisplay = portfolioData.network ? portfolioData.network.toUpperCase() : 'MAINNET';
  
  // Check if this is fallback data (indicates API issues)
  const isApiFallback = portfolioData.timeline?.some(event => 
    event.action === "Direct API Mode" || 
    event.description?.includes("API") ||
    event.description?.includes("demonstration")
  );

  return (
    <div className="space-y-8">
      {isApiFallback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Direct API Mode:</strong> Fetching data directly from Sei REST API endpoints. 
              This method provides real blockchain data without external dependencies.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Portfolio Performance - {portfolioData.walletAddress.slice(0, 8)}...{portfolioData.walletAddress.slice(-6)}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <p className={`text-sm font-medium ${isApiFallback ? 'text-blue-600' : 'text-green-600'}`}>
                {isApiFallback ? 'Direct API integration' : 'Live blockchain data'} from Sei Network {networkDisplay}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <PortfolioChart data={portfolioData.chartData} />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <PortfolioSummary data={portfolioData.summary} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <AiTradeSummaryCard tradeData={tradeData} />
      </motion.div>
    </div>
  );
};

export default PortfolioDisplay;
