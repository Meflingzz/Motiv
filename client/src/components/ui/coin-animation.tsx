import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CoinAnimationProps {
  value: number;
  isVisible: boolean;
  onComplete: () => void;
  x?: number;
  y?: number;
}

export function CoinAnimation({ value, isVisible, onComplete, x = 0, y = 0 }: CoinAnimationProps) {
  const [localVisible, setLocalVisible] = useState(isVisible);
  
  useEffect(() => {
    if (isVisible) {
      setLocalVisible(true);
      const timer = setTimeout(() => {
        setLocalVisible(false);
        onComplete();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);
  
  return (
    <AnimatePresence>
      {localVisible && (
        <motion.div
          initial={{ opacity: 1, y: 0, x }}
          animate={{ opacity: 0, y: y - 50, x }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="fixed text-xl font-bold text-accent z-50 pointer-events-none"
        >
          {value > 0 ? `+${value}` : value}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CoinAnimation;
