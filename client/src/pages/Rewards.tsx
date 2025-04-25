import { useQuery } from "@tanstack/react-query";
import RewardCard from "@/components/rewards/RewardCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Info } from "lucide-react";

interface RewardsProps {
  userId: number;
}

export default function Rewards({ userId }: RewardsProps) {
  const { data: rewards = [], isLoading } = useQuery({
    queryKey: [`/api/user/${userId}/rewards`],
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Награды</h1>
        <p className="text-gray-600">
          Выполняйте задачи, чтобы заработать монеты, затем тратьте их на эти награды.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <p className="text-blue-700 font-medium mb-1">Как работают награды?</p>
          <p className="text-blue-600 text-sm">
            Вы можете потратить заработанные монеты на временный доступ к развлечениям. 
            После разблокировки начнется таймер, и по его истечении вам нужно будет вернуться к работе.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : rewards.length > 0 ? (
        <div className="space-y-4">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userId={userId}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-100 shadow-sm">
          <Gift className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <p className="text-lg font-medium mb-2">Нет доступных наград</p>
          <p>Награды будут добавлены в ближайшее время</p>
        </div>
      )}
    </div>
  );
}
