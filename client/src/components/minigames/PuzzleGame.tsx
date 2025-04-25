import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Timer, Award, RefreshCw, Coins } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { calculateCoinsEarned } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PuzzleGameProps {
  onClose: () => void;
}

// Размер сетки
const GRID_SIZE = 4;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

// Функция для создания перемешанной доски (решаемой головоломки)
const generateSolvablePuzzle = (): number[] => {
  // Создаем решенную головоломку [1, 2, 3, ..., 15, 0], где 0 - пустая клетка
  const solved = Array.from({ length: TOTAL_CELLS }, (_, i) => (i + 1) % TOTAL_CELLS);
  
  // Перемешиваем
  let shuffled = [...solved];
  
  // Количество перемещений для создания случайной, но решаемой головоломки
  const moves = 100 + Math.floor(Math.random() * 50);
  
  let emptyPos = TOTAL_CELLS - 1; // Изначально пустая клетка в правом нижнем углу
  
  for (let i = 0; i < moves; i++) {
    // Находим соседние клетки с пустой
    const neighbors = [];
    
    // Верхняя клетка
    if (emptyPos >= GRID_SIZE) {
      neighbors.push(emptyPos - GRID_SIZE);
    }
    
    // Нижняя клетка
    if (emptyPos < TOTAL_CELLS - GRID_SIZE) {
      neighbors.push(emptyPos + GRID_SIZE);
    }
    
    // Левая клетка
    if (emptyPos % GRID_SIZE !== 0) {
      neighbors.push(emptyPos - 1);
    }
    
    // Правая клетка
    if ((emptyPos + 1) % GRID_SIZE !== 0) {
      neighbors.push(emptyPos + 1);
    }
    
    // Выбираем случайную соседнюю клетку
    const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
    
    // Меняем местами
    [shuffled[emptyPos], shuffled[randomNeighbor]] = [shuffled[randomNeighbor], shuffled[emptyPos]];
    
    // Обновляем позицию пустой клетки
    emptyPos = randomNeighbor;
  }
  
  return shuffled;
};

// Проверка, является ли головоломка решенной
const isPuzzleSolved = (puzzle: number[]): boolean => {
  for (let i = 0; i < TOTAL_CELLS - 1; i++) {
    if (puzzle[i] !== i + 1) {
      return false;
    }
  }
  return puzzle[TOTAL_CELLS - 1] === 0;
};

// Проверка, может ли клетка двигаться (соседняя с пустой)
const canMove = (index: number, puzzle: number[]): boolean => {
  const emptyIndex = puzzle.indexOf(0);
  
  // Ячейка слева от пустой
  if (emptyIndex % GRID_SIZE !== 0 && emptyIndex - 1 === index) {
    return true;
  }
  
  // Ячейка справа от пустой
  if ((emptyIndex + 1) % GRID_SIZE !== 0 && emptyIndex + 1 === index) {
    return true;
  }
  
  // Ячейка сверху от пустой
  if (emptyIndex >= GRID_SIZE && emptyIndex - GRID_SIZE === index) {
    return true;
  }
  
  // Ячейка снизу от пустой
  if (emptyIndex < TOTAL_CELLS - GRID_SIZE && emptyIndex + GRID_SIZE === index) {
    return true;
  }
  
  return false;
};

export default function PuzzleGame({ onClose }: PuzzleGameProps) {
  const [puzzle, setPuzzle] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const { toast } = useToast();
  
  // Подсчитываем очки на основе количества ходов и времени
  const calculateScore = (moves: number, time: number): number => {
    // Базовые очки
    const basePoints = 1000;
    
    // Штраф за количество ходов (чем больше ходов, тем меньше очков)
    const movesPenalty = Math.min(moves * 2, 500);
    
    // Штраф за время (чем больше времени, тем меньше очков)
    const timePenalty = Math.min(time, 300);
    
    // Итоговые очки
    const finalScore = Math.max(basePoints - movesPenalty - timePenalty, 100);
    
    return Math.round(finalScore);
  };
  
  // Мутация для сохранения результата
  const scoreMutation = useMutation({
    mutationFn: async (data: { gameType: string; score: number }) => {
      return await apiRequest("POST", "/api/mini-game-scores", data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/1/mini-game-scores"] });
      if (data && typeof data.coinsEarned === 'number') {
        setCoinsEarned(data.coinsEarned);
      }
      
      toast({
        title: "Счет сохранен!",
        description: `Вы заработали ${data && data.coinsEarned ? data.coinsEarned : 0} монет.`,
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить счет.",
        variant: "destructive",
      });
    }
  });
  
  // Перемешиваем головоломку в начале игры
  const startGame = () => {
    setPuzzle(generateSolvablePuzzle());
    setMoves(0);
    setTimer(0);
    setIsGameStarted(true);
    setIsGameOver(false);
  };
  
  // Перезапуск игры
  const restartGame = () => {
    startGame();
  };
  
  // Перемещение клетки
  const moveTile = (index: number) => {
    if (!isGameStarted || isGameOver) return;
    
    // Проверяем, может ли клетка двигаться
    if (!canMove(index, puzzle)) return;
    
    // Перемещаем клетку
    const emptyIndex = puzzle.indexOf(0);
    const newPuzzle = [...puzzle];
    
    // Меняем местами значения
    [newPuzzle[index], newPuzzle[emptyIndex]] = [newPuzzle[emptyIndex], newPuzzle[index]];
    
    // Обновляем состояние
    setPuzzle(newPuzzle);
    setMoves(moves + 1);
    
    // Проверяем, решена ли головоломка
    if (isPuzzleSolved(newPuzzle)) {
      setIsGameOver(true);
      const gameScore = calculateScore(moves + 1, timer);
      setScore(gameScore);
      scoreMutation.mutate({ gameType: "puzzle", score: gameScore });
    }
  };
  
  // Эффект для старта игры
  useEffect(() => {
    startGame();
  }, []);
  
  // Таймер
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isGameStarted && !isGameOver) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isGameStarted, isGameOver]);
  
  // Форматирование времени
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="puzzle-game">
      {isGameOver ? (
        <div className="p-6 text-center">
          <div className="relative mb-8">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 h-10 w-10 rounded-full flex items-center justify-center z-10 shadow-md">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div className="pt-5 pb-4 px-5 bg-amber-50 rounded-xl border border-amber-100">
              <h2 className="text-xl font-bold text-amber-800 mb-1">Поздравляем!</h2>
              <p className="text-sm text-amber-700 mb-1">
                Вы решили головоломку за <span className="font-semibold">{moves} ходов</span> и <span className="font-semibold">{formatTime(timer)}</span>
              </p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 mb-8">
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-center min-w-[110px] shadow-sm">
              <div className="text-2xl font-bold text-gray-700">{score}</div>
              <div className="text-xs text-gray-500 font-medium">Очки</div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4 text-center min-w-[110px] shadow-sm">
              <div className="text-2xl font-bold text-amber-600 flex items-center justify-center">
                <Coins className="h-5 w-5 mr-1" />
                {coinsEarned}
              </div>
              <div className="text-xs text-amber-600 font-medium">Монеты</div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-3">
            <Button variant="outline" onClick={onClose} className="px-5">
              Закрыть
            </Button>
            <Button onClick={restartGame} className="bg-amber-500 hover:bg-amber-600 text-white px-5">
              Играть снова
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex space-x-4">
              <div className="flex items-center text-sm">
                <Timer className="h-4 w-4 mr-1" />
                {formatTime(timer)}
              </div>
              
              <div className="text-sm">
                Ходы: {moves}
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={restartGame}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-5">
            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
              <AnimatePresence>
                {puzzle.map((value, index) => (
                  <motion.div
                    key={value}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    whileHover={value !== 0 ? { scale: canMove(index, puzzle) ? 1.05 : 1 } : {}}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xl font-bold shadow-sm ${
                      value === 0 
                        ? "bg-transparent" 
                        : canMove(index, puzzle)
                          ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white cursor-pointer hover:shadow-md"
                          : "bg-gradient-to-br from-amber-300 to-amber-500 text-white"
                    }`}
                    onClick={() => moveTile(index)}
                  >
                    {value !== 0 && value}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="text-center mt-6 bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800 text-sm">
              <p className="mb-1 font-medium">Как играть:</p>
              <p className="text-xs">
                Нажимайте на ячейки рядом с пустой клеткой, чтобы перемещать их.<br />
                Соберите числа по порядку от 1 до 15.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}