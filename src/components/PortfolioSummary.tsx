
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface SummaryData {
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
}

interface PortfolioSummaryProps {
  data: SummaryData;
}

const PortfolioSummary = ({ data }: PortfolioSummaryProps) => {
  const formatCurrency = (amount: number) => {
    const isPositive = amount >= 0;
    return `${isPositive ? '+' : ''}$${amount.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    const isPositive = percentage >= 0;
    return `${isPositive ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Best Trade</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(data.bestTrade.gain)}
          </div>
          <p className="text-xs text-green-700 mt-1">
            {data.bestTrade.token} • {formatPercentage(data.bestTrade.percentage)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800">Worst Trade</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-900">
            {formatCurrency(data.worstTrade.loss)}
          </div>
          <p className="text-xs text-red-700 mt-1">
            {data.worstTrade.token} • {formatPercentage(data.worstTrade.percentage)}
          </p>
        </CardContent>
      </Card>

      <Card className={`bg-gradient-to-br ${
        data.totalGainLoss.amount >= 0 
          ? 'from-blue-50 to-blue-100 border-blue-200' 
          : 'from-gray-50 to-gray-100 border-gray-200'
      }`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`text-sm font-medium ${
            data.totalGainLoss.amount >= 0 ? 'text-blue-800' : 'text-gray-800'
          }`}>
            Total Gain/Loss
          </CardTitle>
          <DollarSign className={`h-4 w-4 ${
            data.totalGainLoss.amount >= 0 ? 'text-blue-600' : 'text-gray-600'
          }`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            data.totalGainLoss.amount >= 0 ? 'text-blue-900' : 'text-gray-900'
          }`}>
            {formatCurrency(data.totalGainLoss.amount)}
          </div>
          <p className={`text-xs mt-1 ${
            data.totalGainLoss.amount >= 0 ? 'text-blue-700' : 'text-gray-700'
          }`}>
            {formatPercentage(data.totalGainLoss.percentage)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;
