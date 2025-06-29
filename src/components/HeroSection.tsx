
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <motion.div 
      className="text-center space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-slate-700 mb-4"
      >
        <Sparkles className="w-4 h-4" />
        Now with Real Blockchain Data
      </motion.div>
      
      <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
        Sei Portfolio Replayer
      </h1>
      <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        Visualize and replay your Sei wallet's trading history with real blockchain data, 
        beautiful charts, and interactive timeline experiences
      </p>
    </motion.div>
  );
};

export default HeroSection;
