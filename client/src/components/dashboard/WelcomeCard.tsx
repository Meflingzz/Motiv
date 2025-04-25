import { useQuery } from "@tanstack/react-query";
import { Award, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WelcomeCardProps {
  userId: number;
  completedToday: number;
  totalTasks: number;
}

export default function WelcomeCard({ userId, completedToday, totalTasks }: WelcomeCardProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/user/${userId}`],
  });

  const username = user?.username || "Пользователь";
  const coins = user?.coins || 0;
  const streak = user?.streak || 0;

  // Функция для склонения русских слов
  const getTasksWord = (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) {
      return 'задачу';
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return 'задачи';
    } else {
      return 'задач';
    }
  };

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-primary via-primary-light to-primary rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-48 bg-primary-light/50 mb-2" />
                <Skeleton className="h-5 w-64 bg-primary-light/30 mb-4" />
              </>
            ) : (
              <>
                <h2 className="font-nunito font-bold text-2xl mb-2 flex items-center">
                  Привет, {username}! <Sparkles className="h-5 w-5 ml-2 text-accent animate-shine" />
                </h2>
                <p className="opacity-90 mb-4">
                  Вы выполнили {completedToday} {getTasksWord(completedToday)} сегодня. Продолжайте в том же духе!
                </p>
              </>
            )}
            
            <div className="flex items-center space-x-6 font-nunito">
              <div className="flex flex-col items-center bg-white/10 px-4 py-2 rounded-lg">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 bg-primary-light/50 mb-1" />
                ) : (
                  <span className="text-2xl font-bold">{totalTasks}</span>
                )}
                <span className="text-xs opacity-80">Задач</span>
              </div>
              
              <div className="flex flex-col items-center bg-white/10 px-4 py-2 rounded-lg">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 bg-primary-light/50 mb-1" />
                ) : (
                  <span className="text-2xl font-bold">{coins}</span>
                )}
                <span className="text-xs opacity-80">Монет</span>
              </div>
              
              <div className="flex flex-col items-center bg-white/10 px-4 py-2 rounded-lg">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 bg-primary-light/50 mb-1" />
                ) : (
                  <span className="text-2xl font-bold">{streak}</span>
                )}
                <span className="text-xs opacity-80">Серия</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="w-28 h-28 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm relative overflow-hidden shadow-inner">
              <Award className="h-16 w-16 text-accent animate-pulse" />
              <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="8" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="8" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 - (283 * (completedToday / 5))} 
                  transform="rotate(-90 50 50)" 
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
