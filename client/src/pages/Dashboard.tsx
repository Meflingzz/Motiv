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
          <h2 className="font-nunito font-bold text-xl text-gray-800">Current Tasks</h2>
          <a href="/tasks" className="text-primary font-medium text-sm">View All</a>
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
            <h2 className="font-nunito font-bold text-xl text-gray-800">Rewards</h2>
            <a href="/rewards" className="text-primary font-medium text-sm">View All</a>
          </div>
          
          <div className="space-y-3">
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
            <h2 className="font-nunito font-bold text-xl text-gray-800">Mini-Games</h2>
            <a href="/mini-games" className="text-primary font-medium text-sm">View All</a>
          </div>
          
          <div className="space-y-3">
            <MiniGameCard
              title="Memory Match"
              description="Test your memory skills"
              icon="Brain"
              color="primary"
              maxCoins={20}
              gameType="memory"
            />
            
            <MiniGameCard
              title="Reaction Time"
              description="Test your reflexes"
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
