import { useQuery } from "@tanstack/react-query";
import RewardCard from "@/components/rewards/RewardCard";
import { Skeleton } from "@/components/ui/skeleton";

interface RewardsProps {
  userId: number;
}

export default function Rewards({ userId }: RewardsProps) {
  const { data: rewards = [], isLoading } = useQuery({
    queryKey: [`/api/user/${userId}/rewards`],
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Rewards</h1>
        <p className="text-gray-600">
          Complete tasks to earn coins, then spend your coins on these rewards.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-3">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userId={userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
