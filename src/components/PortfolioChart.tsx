
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ChartData {
  date: string;
  value: number;
}

interface PortfolioChartProps {
  data: ChartData[];
  animated?: boolean;
}

const PortfolioChart = ({ data, animated = false }: PortfolioChartProps) => {
  const formatValue = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate initial value for reference line
  const initialValue = data.length > 0 ? data[0].value : 0;
  const currentValue = data.length > 0 ? data[data.length - 1].value : 0;
  const isGaining = currentValue >= initialValue;

  // Custom tooltip to show P&L
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const pnl = value - initialValue;
      const pnlPercentage = initialValue ? ((pnl / initialValue) * 100) : 0;
      
      return (
        <div className="bg-white/95 border border-slate-300 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-slate-700">{`Date: ${formatDate(label)}`}</p>
          <p className="text-blue-600">{`Value: ${formatValue(value)}`}</p>
          <p className={`${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {`P&L: ${pnl >= 0 ? '+' : ''}${formatValue(pnl)} (${pnlPercentage >= 0 ? '+' : ''}${pnlPercentage.toFixed(2)}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis 
            tickFormatter={formatValue}
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Reference line for initial value */}
          <ReferenceLine 
            y={initialValue} 
            stroke="#94a3b8" 
            strokeDasharray="5 5" 
            label={{ value: "Initial Value", position: "left" }}
          />
          
          <Line
            type="monotone"
            dataKey="value"
            stroke={isGaining ? "#16a34a" : "#dc2626"}
            strokeWidth={3}
            dot={{ fill: isGaining ? "#16a34a" : "#dc2626", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: isGaining ? "#15803d" : "#b91c1c" }}
            animationDuration={animated ? 300 : 0}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* P&L Summary */}
      <div className="mt-4 flex justify-between items-center bg-slate-50 p-3 rounded-lg">
        <div className="text-sm text-slate-600">
          <span>Initial: {formatValue(initialValue)}</span>
        </div>
        <div className="text-sm text-slate-600">
          <span>Current: {formatValue(currentValue)}</span>
        </div>
        <div className={`text-sm font-semibold ${isGaining ? 'text-green-600' : 'text-red-600'}`}>
          <span>{isGaining ? '+' : ''}{formatValue(currentValue - initialValue)} ({((currentValue - initialValue) / initialValue * 100).toFixed(2)}%)</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioChart;
