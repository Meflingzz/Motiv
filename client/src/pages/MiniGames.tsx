import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MiniGameCard from "@/components/minigames/MiniGameCard";
import MemoryGame from "@/components/minigames/MemoryGame";
import ReactionGame from "@/components/minigames/ReactionGame";
import PuzzleGame from "@/components/minigames/PuzzleGame";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Trophy, Calendar, Coins, Zap, Info, Puzzle } from "lucide-react";

interface MiniGamesProps {
  userId: number;
}

export default function MiniGames({ userId }: MiniGamesProps) {
  const [activeGame, setActiveGame] = useState<"memory" | "reaction" | "puzzle" | null>(null);
  
  const { data: scores = [] } = useQuery({
    queryKey: [`/api/user/${userId}/mini-game-scores`],
  });
  
  const memoryBestScore = scores
    .filter((score: any) => score.gameType === "memory")
    .reduce((max: number, score: any) => Math.max(max, score.score), 0);
    
  const reactionBestScore = scores
    .filter((score: any) => score.gameType === "reaction")
    .reduce((max: number, score: any) => Math.max(max, score.score), 0);

  const puzzleBestScore = scores
    .filter((score: any) => score.gameType === "puzzle")
    .reduce((max: number, score: any) => Math.max(max, score.score), 0);
  
  const todaysMemoryScores = scores
    .filter((score: any) => {
      const scoreDate = new Date(score.createdAt);
      const today = new Date();
      return score.gameType === "memory" && 
             scoreDate.getDate() === today.getDate() &&
             scoreDate.getMonth() === today.getMonth() &&
             scoreDate.getFullYear() === today.getFullYear();
    });
    
  const todaysReactionScores = scores
    .filter((score: any) => {
      const scoreDate = new Date(score.createdAt);
      const today = new Date();
      return score.gameType === "reaction" && 
             scoreDate.getDate() === today.getDate() &&
             scoreDate.getMonth() === today.getMonth() &&
             scoreDate.getFullYear() === today.getFullYear();
    });
    
  const todaysPuzzleScores = scores
    .filter((score: any) => {
      const scoreDate = new Date(score.createdAt);
      const today = new Date();
      return score.gameType === "puzzle" && 
             scoreDate.getDate() === today.getDate() &&
             scoreDate.getMonth() === today.getMonth() &&
             scoreDate.getFullYear() === today.getFullYear();
    });
    
  const memoryPlaysToday = todaysMemoryScores.length;
  const reactionPlaysToday = todaysReactionScores.length;
  const puzzlePlaysToday = todaysPuzzleScores.length;
  
  const memoryCoinsToday = todaysMemoryScores.reduce((sum: number, score: any) => sum + score.coinsEarned, 0);
  const reactionCoinsToday = todaysReactionScores.reduce((sum: number, score: any) => sum + score.coinsEarned, 0);
  const puzzleCoinsToday = todaysPuzzleScores.reduce((sum: number, score: any) => sum + score.coinsEarned, 0);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Мини-игры</h1>
        <p className="text-gray-600">
          Играйте в эти тренировочные игры для мозга, чтобы заработать дополнительные монеты и держать ум в тонусе.
        </p>
      </div>
      
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 flex items-start">
        <Info className="h-5 w-5 text-indigo-500 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <p className="text-indigo-700 font-medium mb-1">Лимит игр</p>
          <p className="text-indigo-600 text-sm">
            Вы можете играть в каждую игру до 3 раз в день. Зарабатывайте монеты за каждую игру в зависимости от вашего результата!
          </p>
        </div>
      </div>
      
      {activeGame === "memory" ? (
        <MemoryGame onClose={() => setActiveGame(null)} />
      ) : activeGame === "reaction" ? (
        <ReactionGame onClose={() => setActiveGame(null)} />
      ) : activeGame === "puzzle" ? (
        <PuzzleGame onClose={() => setActiveGame(null)} />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="mb-4">
              <MiniGameCard
                title="Игра на память"
                description="Проверьте свою память, сопоставляя пары карточек"
                icon="Brain"
                color="primary"
                maxCoins={20}
                gameType="memory"
                onPlay={() => setActiveGame("memory")}
              />
              
              <Card className="mt-4 border border-gray-100">
                <CardContent className="py-5">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg">
                      <Trophy className="h-4 w-4 text-primary mb-1" />
                      <p className="text-gray-500 text-xs">Лучший счет</p>
                      <p className="font-medium">{memoryBestScore} очков</p>
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg">
                      <Calendar className="h-4 w-4 text-primary mb-1" />
                      <p className="text-gray-500 text-xs">Игр сегодня</p>
                      <p className="font-medium">{memoryPlaysToday}/3</p>
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg">
                      <Coins className="h-4 w-4 text-accent mb-1" />
                      <p className="text-gray-500 text-xs">Монет сегодня</p>
                      <p className="font-medium">{memoryCoinsToday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <MiniGameCard
                title="Скорость реакции"
                description="Проверьте свою реакцию, нажимая как можно быстрее"
                icon="Zap"
                color="secondary"
                maxCoins={15}
                gameType="reaction"
                onPlay={() => setActiveGame("reaction")}
              />
              
              <Card className="mt-4 border border-gray-100">
                <CardContent className="py-5">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg">
                      <Trophy className="h-4 w-4 text-secondary mb-1" />
                      <p className="text-gray-500 text-xs">Лучший счет</p>
                      <p className="font-medium">{reactionBestScore} мс</p>
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg">
                      <Calendar className="h-4 w-4 text-secondary mb-1" />
                      <p className="text-gray-500 text-xs">Игр сегодня</p>
                      <p className="font-medium">{reactionPlaysToday}/3</p>
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg">
                      <Coins className="h-4 w-4 text-accent mb-1" />
                      <p className="text-gray-500 text-xs">Монет сегодня</p>
                      <p className="font-medium">{reactionCoinsToday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <MiniGameCard
                title="Пятнашки"
                description="Расставьте числа по порядку"
                icon="Puzzle"
                color="amber"
                maxCoins={25}
                gameType="puzzle"
                onPlay={() => setActiveGame("puzzle")}
              />
              
              <Card className="mt-4 border border-gray-100">
                <CardContent className="py-5">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg">
                      <Trophy className="h-4 w-4 text-amber-600 mb-1" />
                      <p className="text-gray-500 text-xs">Лучший счет</p>
                      <p className="font-medium">{puzzleBestScore} очков</p>
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg">
                      <Calendar className="h-4 w-4 text-amber-600 mb-1" />
                      <p className="text-gray-500 text-xs">Игр сегодня</p>
                      <p className="font-medium">{puzzlePlaysToday}/3</p>
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg">
                      <Coins className="h-4 w-4 text-accent mb-1" />
                      <p className="text-gray-500 text-xs">Монет сегодня</p>
                      <p className="font-medium">{puzzleCoinsToday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
