
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ReplayButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const ReplayButton = ({ onClick, disabled }: ReplayButtonProps) => {
  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <motion.div
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          onClick={onClick}
          size="lg"
          disabled={disabled}
          className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white px-12 py-4 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <motion.span
            className="flex items-center gap-2"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            🎬 Start Portfolio Replay
          </motion.span>
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ReplayButton;
