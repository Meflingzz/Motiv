import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCoins } from "@/hooks/use-coins";
import { calculateCoinsEarned } from "@/lib/utils";
import { motion } from "framer-motion";

interface MemoryGameProps {
  onClose: () => void;
}

// Card symbols
const SYMBOLS = ["🎮", "🎯", "🎲", "🎪", "🎭", "🎨", "🎬", "🎤"];

export default function MemoryGame({ onClose }: MemoryGameProps) {
  const userId = 1; // Default to demo user
  const { toast } = useToast();
  const { addCoins } = useCoins(userId);
  
  const [cards, setCards] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const totalPairs = SYMBOLS.length;
  
  const scoreMutation = useMutation({
    mutationFn: async (score: number) => {
      const coinsEarned = calculateCoinsEarned(score, "memory");
      return await apiRequest("POST", "/api/mini-game-scores", {
        userId,
        gameType: "memory",
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
  
  // Initialize game
  const initializeGame = () => {
    // Create pairs of cards with symbols
    const cardPairs = [...SYMBOLS, ...SYMBOLS].map((symbol, index) => ({
      id: index,
      symbol,
      flipped: false,
      matched: false,
    }));
    
    // Shuffle cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setGameOver(false);
    setGameStarted(true);
  };
  
  // Handle card click
  const handleCardClick = (id: number) => {
    // Don't allow more than 2 cards to be flipped at once
    if (flippedCards.length === 2 || cards[id].flipped || cards[id].matched) {
      return;
    }
    
    // Flip the card
    const updatedCards = cards.map(card => 
      card.id === id ? { ...card, flipped: true } : card
    );
    setCards(updatedCards);
    
    // Add to flipped cards
    const updatedFlippedCards = [...flippedCards, id];
    setFlippedCards(updatedFlippedCards);
    
    // If we have 2 flipped cards, check for match
    if (updatedFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = updatedFlippedCards;
      const firstCard = updatedCards[firstId];
      const secondCard = updatedCards[secondId];
      
      if (firstCard.symbol === secondCard.symbol) {
        // Cards match
        setTimeout(() => {
          const matchedCards = updatedCards.map(card => 
            card.id === firstId || card.id === secondId
              ? { ...card, matched: true }
              : card
          );
          setCards(matchedCards);
          setFlippedCards([]);
          setMatchedPairs(prev => prev + 1);
        }, 500);
      } else {
        // Cards don't match, flip them back
        setTimeout(() => {
          const resetCards = updatedCards.map(card => 
            card.id === firstId || card.id === secondId
              ? { ...card, flipped: false }
              : card
          );
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };
  
  // Check for game over
  useEffect(() => {
    if (gameStarted && matchedPairs === totalPairs) {
      setGameOver(true);
      
      // Calculate score - fewer moves is better
      const score = Math.max(100 - (moves - totalPairs) * 5, 0);
      
      // Save score and earn coins
      scoreMutation.mutate(score);
    }
  }, [matchedPairs, totalPairs, gameStarted, moves, scoreMutation]);
  
  // Calculate score
  const calculateScore = () => {
    return Math.max(100 - (moves - totalPairs) * 5, 0);
  };
  
  return (
    <div className="p-6">
      {!gameStarted ? (
        <div className="text-center py-8">
          <h3 className="text-xl font-bold mb-4">Memory Match</h3>
          <p className="mb-6 text-gray-600">
            Flip cards to find matching pairs. The fewer moves you make, the more coins you earn!
          </p>
          <Button 
            onClick={initializeGame}
            className="game-button shadow-button bg-primary text-white"
          >
            Start Game
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <div className="text-sm font-medium">
              Pairs: {matchedPairs}/{totalPairs}
            </div>
            <div className="text-sm font-medium">
              Moves: {moves}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {cards.map(card => (
              <motion.div
                key={card.id}
                whileHover={{ scale: card.flipped || card.matched ? 1 : 1.05 }}
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square rounded-lg cursor-pointer text-3xl flex items-center justify-center 
                  ${card.flipped || card.matched 
                    ? "bg-primary-light text-white" 
                    : "bg-primary text-primary"}`}
              >
                {(card.flipped || card.matched) && card.symbol}
              </motion.div>
            ))}
          </div>
          
          {gameOver ? (
            <div className="mt-6 text-center">
              <h3 className="text-xl font-bold mb-2">Game Over!</h3>
              <p className="mb-4">
                You completed the game in {moves} moves.
                <br />
                Score: {calculateScore()} points
              </p>
              <div className="flex space-x-2 justify-center">
                <Button 
                  onClick={initializeGame}
                  className="game-button shadow-button bg-primary text-white"
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
          ) : (
            <div className="text-center mt-4">
              <Button 
                onClick={() => {
                  setGameOver(true);
                  setGameStarted(false);
                }}
                variant="outline"
              >
                Quit Game
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
