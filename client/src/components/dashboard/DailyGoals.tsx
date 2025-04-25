import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, Dumbbell, Droplet, Pencil, BookOpen, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCoins } from "@/hooks/use-coins";
import CoinAnimation from "@/components/ui/coin-animation";
import { useState } from "react";

interface DailyGoalsProps {
  userId: number;
}

export default function DailyGoals({ userId }: DailyGoalsProps) {
  const { toast } = useToast();
  const { addCoins } = useCoins(userId);
  const [animateCoin, setAnimateCoin] = useState(false);
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });

  const { data: goals = [], isLoading } = useQuery({
    queryKey: [`/api/user/${userId}/daily-goals`],
  });

  const completeMutation = useMutation({
    mutationFn: async (goalId: number) => {
      return await apiRequest("POST", `/api/daily-goals/${goalId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}/daily-goals`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
      
      toast({
        title: "Goal completed!",
        description: "You earned 15 coins.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete goal.",
        variant: "destructive",
      });
    }
  });

  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const completionPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  // Map icon names to components
  const iconMap: Record<string, React.ReactNode> = {
    "book-read": <Book className="h-5 w-5" />,
    "heart-pulse": <Dumbbell className="h-5 w-5" />,
    "water-flash": <Droplet className="h-5 w-5" />,
    "book": <BookOpen className="h-5 w-5" />,
    "computer": <Code className="h-5 w-5" />,
    "pencil": <Pencil className="h-5 w-5" />,
  };

  const completeGoal = (goalId: number, event: React.MouseEvent) => {
    const goal = goals.find(g => g.id === goalId);
    
    if (goal && !goal.isCompleted) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setAnimationPosition({ 
        x: rect.left + rect.width / 2,
        y: rect.top 
      });
      
      completeMutation.mutate(goalId);
      setAnimateCoin(true);
      addCoins(15);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-nunito font-bold text-xl text-gray-800">Today's Goals</h2>
        <span className="text-sm text-gray-500">
          {completedGoals}/{totalGoals} Completed
        </span>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-md">
        <Progress value={completionPercentage} className="h-3 mb-4" />
        
        <div className="grid grid-cols-5 gap-2">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="w-12 h-12 rounded-full mb-1" />
                <Skeleton className="w-16 h-4" />
              </div>
            ))
          ) : (
            goals.map(goal => (
              <div key={goal.id} className="flex flex-col items-center">
                <button
                  className={`w-12 h-12 flex items-center justify-center rounded-full border-2 ${
                    goal.isCompleted
                      ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-gray-300 text-gray-400 hover:border-secondary hover:bg-secondary/5 hover:text-secondary transition-colors"
                  } mb-1`}
                  onClick={(e) => completeGoal(goal.id, e)}
                  disabled={goal.isCompleted}
                >
                  {iconMap[goal.icon] || <Pencil className="h-5 w-5" />}
                </button>
                <span className={`text-xs text-center font-medium ${
                  goal.isCompleted ? "text-gray-800" : "text-gray-500"
                }`}>
                  {goal.title}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      
      <CoinAnimation 
        value={15}
        isVisible={animateCoin}
        onComplete={() => setAnimateCoin(false)}
        x={animationPosition.x}
        y={animationPosition.y}
      />
    </div>
  );
}
