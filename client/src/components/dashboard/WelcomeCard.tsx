import { useQuery } from "@tanstack/react-query";
import { Award } from "lucide-react";
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

  const username = user?.username || "User";
  const coins = user?.coins || 0;
  const streak = user?.streak || 0;

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-6 text-white shadow-md">
        <div className="flex items-start justify-between">
          <div>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-48 bg-primary-light/50 mb-2" />
                <Skeleton className="h-5 w-64 bg-primary-light/30 mb-4" />
              </>
            ) : (
              <>
                <h2 className="font-nunito font-bold text-2xl mb-2">Welcome back, {username}!</h2>
                <p className="opacity-90 mb-4">
                  You've completed {completedToday} task{completedToday !== 1 ? 's' : ''} today. Keep going!
                </p>
              </>
            )}
            
            <div className="flex items-center space-x-4 font-nunito">
              <div className="flex flex-col items-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 bg-primary-light/50 mb-1" />
                ) : (
                  <span className="text-2xl font-bold">{totalTasks}</span>
                )}
                <span className="text-xs opacity-80">Tasks</span>
              </div>
              
              <div className="flex flex-col items-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 bg-primary-light/50 mb-1" />
                ) : (
                  <span className="text-2xl font-bold">{coins}</span>
                )}
                <span className="text-xs opacity-80">Coins</span>
              </div>
              
              <div className="flex flex-col items-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 bg-primary-light/50 mb-1" />
                ) : (
                  <span className="text-2xl font-bold">{streak}</span>
                )}
                <span className="text-xs opacity-80">Streak</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white/20 relative overflow-hidden">
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
