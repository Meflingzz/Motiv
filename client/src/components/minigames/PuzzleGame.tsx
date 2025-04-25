import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Timer, Award, RefreshCw } from "lucide-react";
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/1/mini-game-scores"] });
      setCoinsEarned(data.coinsEarned);
      
      toast({
        title: "Счет сохранен!",
        description: `Вы заработали ${data.coinsEarned} монет.`,
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
          <Award className="h-16 w-16 mx-auto text-accent mb-4" />
          <h2 className="text-2xl font-bold mb-2">Поздравляем!</h2>
          <p className="mb-4">Вы решили головоломку за {moves} ходов и {formatTime(timer)}.</p>
          
          <div className="flex justify-center space-x-4 mb-6">
            <div className="bg-gray-100 rounded-lg p-3 text-center min-w-[100px]">
              <div className="text-2xl font-bold">{score}</div>
              <div className="text-xs text-gray-500">Очки</div>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-3 text-center text-accent min-w-[100px]">
              <div className="text-2xl font-bold">{coinsEarned}</div>
              <div className="text-xs">Монеты</div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-2">
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
            <Button onClick={restartGame}>
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
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`aspect-square rounded-md flex items-center justify-center text-xl font-bold ${
                      value === 0 
                        ? "bg-transparent" 
                        : canMove(index, puzzle)
                          ? "bg-primary/80 text-white cursor-pointer hover:bg-primary"
                          : "bg-primary-light/60 text-white"
                    }`}
                    onClick={() => moveTile(index)}
                  >
                    {value !== 0 && value}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="text-center mt-5 text-gray-500 text-sm">
              Нажимайте на ячейки, чтобы перемещать их в пустые места. <br />
              Соберите числа по порядку от 1 до 15.
            </div>
          </div>
        </>
      )}
    </div>
  );
}