import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useCoins(userId: number) {
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/user/${userId}`],
  });

  const updateCoinsMutation = useMutation({
    mutationFn: async (newCoins: number) => {
      await apiRequest('POST', `/api/user/${userId}/coins`, { coins: newCoins });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update coins.",
        variant: "destructive",
      });
    }
  });

  const addCoins = (amount: number) => {
    if (!user) return;
    const newTotal = user.coins + amount;
    updateCoinsMutation.mutate(newTotal);
  };

  const subtractCoins = (amount: number) => {
    if (!user) return;
    if (user.coins < amount) {
      toast({
        title: "Not enough coins",
        description: `You need ${amount} coins, but only have ${user.coins}`,
        variant: "destructive",
      });
      return false;
    }
    
    const newTotal = user.coins - amount;
    updateCoinsMutation.mutate(newTotal);
    return true;
  };

  return {
    coins: user?.coins || 0,
    isLoading,
    addCoins,
    subtractCoins,
    isPending: updateCoinsMutation.isPending,
  };
}
