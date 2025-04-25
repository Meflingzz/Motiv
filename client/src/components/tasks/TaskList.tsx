import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Clock, MoreVertical, Coins } from "lucide-react";
import { formatDate, formatTimeOnly } from "@/lib/utils";
import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useCoins } from "@/hooks/use-coins";
import { motion } from "framer-motion";
import CoinAnimation from "@/components/ui/coin-animation";

interface TaskListProps {
  tasks: any[];
  userId: number;
  showCompleted?: boolean;
  onDeleteTask?: (taskId: number) => void;
}

export default function TaskList({ tasks, userId, showCompleted = true, onDeleteTask }: TaskListProps) {
  const { toast } = useToast();
  const { addCoins } = useCoins(userId);
  const [animateCoin, setAnimateCoin] = useState(false);
  const [coinAmount, setCoinAmount] = useState(0);
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });

  const completeMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return await apiRequest("POST", `/api/tasks/${taskId}/complete`, {});
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}/tasks`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
      
      toast({
        title: "Задача выполнена!",
        description: `Вы заработали ${data.coinReward} монет.`,
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить задачу.",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return await apiRequest("DELETE", `/api/tasks/${taskId}`, {});
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}/tasks`] });
      
      toast({
        title: "Задача удалена",
        description: "Задача была успешно удалена.",
      });
      
      if (onDeleteTask) {
        onDeleteTask(taskId);
      }
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить задачу.",
        variant: "destructive",
      });
    }
  });

  const completeTask = (taskId: number, coinReward: number, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setAnimationPosition({ 
      x: rect.left + rect.width / 2,
      y: rect.top 
    });
    
    setCoinAmount(coinReward);
    setAnimateCoin(true);
    completeMutation.mutate(taskId);
    addCoins(coinReward);
  };

  const deleteTask = (taskId: number) => {
    deleteMutation.mutate(taskId);
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-gray-500">
          Нет доступных задач. Создайте задачи, чтобы начать!
        </CardContent>
      </Card>
    );
  }

  const filteredTasks = showCompleted 
    ? tasks 
    : tasks.filter(task => !task.isCompleted);

  return (
    <div className="space-y-3">
      {filteredTasks.map((task) => (
        <motion.div 
          key={task.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className={`task-card bg-white rounded-xl p-4 shadow-md border border-gray-100 ${
            task.isCompleted ? "opacity-80" : ""
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3 mt-1">
              {task.isCompleted ? (
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-white border-2 border-secondary shadow-sm">
                  <Check className="h-3.5 w-3.5" />
                </div>
              ) : (
                <button 
                  className="w-6 h-6 rounded-full border-2 border-primary hover:bg-primary/10 transition-all shadow-sm"
                  onClick={(e) => completeTask(task.id, task.coinReward, e)}
                  aria-label="Отметить как выполненное"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-gray-800 break-words ${
                task.isCompleted ? "line-through text-gray-500" : ""
              }`}>
                {task.title}
              </h3>
              <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 mt-1 gap-1">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {task.dueDate 
                      ? `${formatTimeOnly(task.dueDate)}`
                      : "Нет срока"}
                  </span>
                </div>
                <span className="hidden sm:inline mx-1">•</span>
                <div className="flex items-center font-medium text-accent whitespace-nowrap">
                  <Coins className="h-3 w-3 mr-1 flex-shrink-0" /> 
                  {task.coinReward}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 ml-2">
              {task.isCompleted ? (
                <span className="text-xs font-medium py-1 px-2 bg-secondary/10 text-secondary rounded-full whitespace-nowrap">
                  Выполнено
                </span>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="text-gray-400 hover:text-primary transition-colors p-1 rounded-full hover:bg-gray-50"
                      aria-label="Опции задачи"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-destructive cursor-pointer"
                      onClick={() => deleteTask(task.id)}
                    >
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </motion.div>
      ))}
      
      <CoinAnimation 
        value={coinAmount}
        isVisible={animateCoin}
        onComplete={() => setAnimateCoin(false)}
        x={animationPosition.x}
        y={animationPosition.y}
      />
    </div>
  );
}
