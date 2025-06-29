
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Sparkles, Globe, CheckCircle } from "lucide-react";

interface WalletInputProps {
  walletAddress: string;
  setWalletAddress: (address: string) => void;
  network: string;
  setNetwork: (network: string) => void;
  handleFetchPortfolio: () => void;
  isLoading: boolean;
  user: any;
}

const WalletInput = ({ 
  walletAddress, 
  setWalletAddress, 
  network,
  setNetwork,
  handleFetchPortfolio, 
  isLoading, 
  user 
}: WalletInputProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl text-slate-800 flex items-center justify-center gap-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            Enter Sei Wallet Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger className="w-32 h-12 border-2 border-slate-200 focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mainnet">Mainnet</SelectItem>
                  <SelectItem value="testnet">Testnet</SelectItem>
                  <SelectItem value="devnet">Devnet</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="sei1abc123..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="flex-1 h-12 text-lg border-2 border-slate-200 focus:border-blue-400 transition-colors"
              />
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full"
            >
              <Button 
                onClick={handleFetchPortfolio}
                disabled={isLoading}
                className="w-full h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  "Fetch Blockchain Data"
                )}
              </Button>
            </motion.div>
          </div>
          
          {!user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-4 rounded-xl"
            >
              <p className="text-amber-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Sign in to unlock replay features and save your portfolio analyses
              </p>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-4 rounded-xl">
              <p className="text-green-700 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                🚀 Direct Sei API Integration for {network.toUpperCase()} Network
              </p>
              <p className="text-green-600 text-sm mt-1">
                • Direct REST API • Real blockchain data • No external dependencies
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                </div>
                <div>
                  <p className="text-blue-700 font-medium text-sm">Ready to Use</p>
                  <p className="text-blue-600 text-xs mt-1">
                    Fetches data directly from Sei's official REST API endpoints. No setup required!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WalletInput;
