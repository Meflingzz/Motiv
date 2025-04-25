import { useQuery } from "@tanstack/react-query";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import DailyGoals from "@/components/dashboard/DailyGoals";
import TaskList from "@/components/tasks/TaskList";
import RewardCard from "@/components/rewards/RewardCard";
import MiniGameCard from "@/components/minigames/MiniGameCard";

interface DashboardProps {
  userId: number;
}

export default function Dashboard({ userId }: DashboardProps) {
  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: [`/api/user/${userId}/tasks`],
  });
  
  // Fetch rewards
  const { data: rewards = [] } = useQuery({
    queryKey: [`/api/user/${userId}/rewards`],
  });
  
  // Calculate completed tasks for today
  const today = new Date().toDateString();
  const completedToday = tasks.filter(task => 
    task.isCompleted && 
    task.completedAt && 
    new Date(task.completedAt).toDateString() === today
  ).length;
  
  // Filter tasks for display (limit to 3)
  const displayTasks = [...tasks]
    .sort((a, b) => {
      // Sort by completeness first
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      // Then by due date (if available)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    })
    .slice(0, 3);
  
  return (
    <>
      <WelcomeCard 
        userId={userId} 
        completedToday={completedToday} 
        totalTasks={tasks.length} 
      />
      
      <DailyGoals userId={userId} />
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-nunito font-bold text-xl text-gray-800">Текущие задачи</h2>
          <a href="/tasks" className="text-primary font-medium text-sm hover:text-primary-dark transition-colors flex items-center">
            Все задачи <span className="ml-1">→</span>
          </a>
        </div>
        <TaskList 
          tasks={displayTasks} 
          userId={userId}
          showCompleted={true}
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Rewards Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-nunito font-bold text-xl text-gray-800">Награды</h2>
            <a href="/rewards" className="text-primary font-medium text-sm hover:text-primary-dark transition-colors flex items-center">
              Все награды <span className="ml-1">→</span>
            </a>
          </div>
          
          <div className="space-y-4">
            {rewards.slice(0, 3).map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                userId={userId}
              />
            ))}
          </div>
        </div>
        
        {/* Mini-Games Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-nunito font-bold text-xl text-gray-800">Мини-игры</h2>
            <a href="/mini-games" className="text-primary font-medium text-sm hover:text-primary-dark transition-colors flex items-center">
              Все игры <span className="ml-1">→</span>
            </a>
          </div>
          
          <div className="space-y-4">
            <MiniGameCard
              title="Игра на память"
              description="Проверьте свою память"
              icon="Brain"
              color="primary"
              maxCoins={20}
              gameType="memory"
            />
            
            <MiniGameCard
              title="Скорость реакции"
              description="Проверьте свою реакцию"
              icon="Zap"
              color="secondary"
              maxCoins={15}
              gameType="reaction"
            />
          </div>
        </div>
      </div>
    </>
  );
}
