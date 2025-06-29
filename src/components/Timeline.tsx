
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface TimelineEvent {
  date: string;
  action: string;
  description: string;
  icon: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

const Timeline = ({ events, currentStep, onStepClick }: TimelineProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-6">
          <motion.h3 
            className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            📈 Trading Timeline
          </motion.h3>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {events.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -2,
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStepClick(index)}
                  className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    index <= currentStep
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md'
                      : 'bg-gray-50 border-2 border-gray-200 opacity-70 hover:opacity-90'
                  }`}
                >
                  <motion.div 
                    className="text-3xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {event.icon}
                  </motion.div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <motion.span 
                        className="font-bold text-slate-800 text-lg"
                        layoutId={`action-${index}`}
                      >
                        {event.action}
                      </motion.span>
                      <motion.span 
                        className="text-sm text-slate-500 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        {event.date}
                      </motion.span>
                    </div>
                    <motion.p 
                      className="text-slate-600 text-sm mt-2 leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      {event.description}
                    </motion.p>
                  </div>
                  
                  <AnimatePresence>
                    {index === currentStep && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Timeline;
