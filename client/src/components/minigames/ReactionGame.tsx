import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCoins } from "@/hooks/use-coins";
import { calculateCoinsEarned, getRandomInt } from "@/lib/utils";
import { motion } from "framer-motion";

interface ReactionGameProps {
  onClose: () => void;
}

enum GameState {
  READY,
  WAITING,
  CLICK,
  RESULTS,
}

export default function ReactionGame({ onClose }: ReactionGameProps) {
  const userId = 1; // Default to demo user
  const { toast } = useToast();
  const { addCoins } = useCoins(userId);
  
  const [gameState, setGameState] = useState<GameState>(GameState.READY);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const timeoutRef = useRef<number | null>(null);
  
  const scoreMutation = useMutation({
    mutationFn: async (score: number) => {
      const coinsEarned = calculateCoinsEarned(score, "reaction");
      return await apiRequest("POST", "/api/mini-game-scores", {
        userId,
        gameType: "reaction",
        score,
        coinsEarned,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
      addCoins(data.coinsEarned);
      
      toast({
        title: "Game completed!",
        description: `You earned ${data.coinsEarned} coins.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save game score.",
        variant: "destructive",
      });
    }
  });
  
  // Clean up any timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Start the game
  const startGame = () => {
    setGameState(GameState.WAITING);
    setReactionTime(null);
    
    // Random delay between 1-4 seconds
    const delay = getRandomInt(1000, 4000);
    
    timeoutRef.current = window.setTimeout(() => {
      setStartTime(Date.now());
      setGameState(GameState.CLICK);
    }, delay);
  };
  
  // Handle click during click phase
  const handleClick = () => {
    if (gameState === GameState.CLICK && startTime !== null) {
      const endTime = Date.now();
      const time = endTime - startTime;
      setReactionTime(time);
      
      // Update best time
      if (bestTime === null || time < bestTime) {
        setBestTime(time);
      }
      
      // Add to attempts
      const newAttempts = [...attempts, time];
      setAttempts(newAttempts);
      
      // End game after 5 attempts
      if (newAttempts.length >= 5) {
        setGameState(GameState.RESULTS);
        
        // Calculate average score
        const avgTime = Math.floor(newAttempts.reduce((a, b) => a + b, 0) / newAttempts.length);
        
        // Save score and earn coins
        scoreMutation.mutate(avgTime);
      } else {
        // Start countdown for next round
        setCountdown(3);
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval);
              startGame();
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else if (gameState === GameState.WAITING) {
      // Clicked too early
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      
      setGameState(GameState.READY);
      toast({
        title: "Too early!",
        description: "Wait for the color to change before clicking.",
        variant: "destructive",
      });
    }
  };
  
  // Reset game
  const resetGame = () => {
    setGameState(GameState.READY);
    setReactionTime(null);
    setStartTime(null);
    setAttempts([]);
    setCountdown(null);
    
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
  };
  
  // Get average reaction time
  const getAverageTime = () => {
    if (attempts.length === 0) return null;
    return Math.floor(attempts.reduce((a, b) => a + b, 0) / attempts.length);
  };
  
  // Content based on game state
  const renderContent = () => {
    switch (gameState) {
      case GameState.READY:
        return (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold mb-4">Reaction Time Test</h3>
            <p className="mb-6 text-gray-600">
              Click as quickly as you can when the color changes from red to green.<br />
              The faster your reactions, the more coins you'll earn!
            </p>
            <Button 
              onClick={startGame}
              className="game-button shadow-button bg-secondary text-white"
            >
              Start Game
            </Button>
          </div>
        );
        
      case GameState.WAITING:
        return (
          <motion.div 
            className="bg-red-500 text-white rounded-lg p-8 text-center cursor-pointer"
            onClick={handleClick}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-xl font-bold mb-4">Wait...</h3>
            <p>Get ready to click when the color changes to green!</p>
          </motion.div>
        );
        
      case GameState.CLICK:
        return (
          <motion.div 
            className="bg-green-500 text-white rounded-lg p-8 text-center cursor-pointer"
            onClick={handleClick}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            <h3 className="text-xl font-bold mb-4">Click Now!</h3>
            <p>Click as fast as you can!</p>
          </motion.div>
        );
        
      case GameState.RESULTS:
        return (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold mb-4">Results</h3>
            <div className="mb-6">
              <p className="text-lg">Your average reaction time:</p>
              <p className="text-3xl font-bold text-secondary">{getAverageTime()} ms</p>
              <p className="text-sm text-gray-500 mt-2">
                (The average human reaction time is 250ms)
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">All attempts:</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {attempts.map((time, index) => (
                  <div 
                    key={index} 
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      time < 250 ? "bg-green-100 text-green-800" : 
                      time < 350 ? "bg-yellow-100 text-yellow-800" : 
                      "bg-red-100 text-red-800"
                    }`}
                  >
                    {time} ms
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-2 justify-center">
              <Button 
                onClick={resetGame}
                className="game-button shadow-button bg-secondary text-white"
              >
                Play Again
              </Button>
              <Button 
                onClick={onClose}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="p-6">
      {countdown !== null && (
        <div className="mb-4 text-center">
          <p className="text-lg font-medium">Next round in: {countdown}</p>
        </div>
      )}
      
      <div className="mb-4 flex justify-between text-sm">
        <div>
          <span className="font-medium">Attempts:</span> {attempts.length}/5
        </div>
        {reactionTime !== null && (
          <div>
            <span className="font-medium">Last:</span> {reactionTime} ms
          </div>
        )}
        {bestTime !== null && (
          <div>
            <span className="font-medium">Best:</span> {bestTime} ms
          </div>
        )}
      </div>
      
      {renderContent()}
    </div>
  );
}
