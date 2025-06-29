
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, Activity, Globe } from "lucide-react";

const StatsCards = () => {
  const stats = [
    { icon: Globe, title: "Sei Mainnet", subtitle: "Live Data", color: "blue" },
    { icon: TrendingUp, title: "Real-time", subtitle: "Portfolio", color: "green" },
    { icon: Activity, title: "Actual Tx", subtitle: "History", color: "purple" },
    { icon: Wallet, title: "Blockchain", subtitle: "Verified", color: "orange" }
  ];

  return (
    <motion.div 
      className="grid md:grid-cols-4 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {stats.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <motion.div 
                  className={`p-3 bg-${item.color}-100 rounded-xl`}
                  whileHover={{ rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                </motion.div>
                <div>
                  <p className="text-sm text-slate-600">{item.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{item.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsCards;
