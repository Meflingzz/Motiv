import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCoins } from "@/hooks/use-coins";
import { Gamepad, Clapperboard, Instagram, Timer, Youtube, Coffee, Music } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface RewardCardProps {
  reward: any;
  userId: number;
}

export default function RewardCard({ reward, userId }: RewardCardProps) {
  const { toast } = useToast();
  const { coins, subtractCoins, isPending } = useCoins(userId);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  // Русские названия для наград
  const translatedTitles: Record<string, string> = {
    "Gaming Time": "Игровое время",
    "Movie Time": "Время для фильмов",
    "Social Media": "Социальные сети",
    "Youtube": "YouTube",
    "Coffee Break": "Кофе-брейк",
    "Music Break": "Музыкальная пауза"
  };

  // Русские описания для наград
  const translatedDescriptions: Record<string, string> = {
    "Take a break and play your favorite game": "Сделайте перерыв и поиграйте в любимую игру",
    "Enjoy watching a movie or TV show": "Насладитесь просмотром фильма или сериала",
    "Check your social media accounts": "Проверьте свои аккаунты в социальных сетях",
    "Watch videos on YouTube": "Посмотрите видео на YouTube",
    "Take a coffee break": "Сделайте перерыв на кофе",
    "Listen to your favorite music": "Послушайте любимую музыку"
  };

  const unlockMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      return await apiRequest("POST", `/api/rewards/${rewardId}/unlock`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}/rewards`] });
      
      toast({
        title: "Награда разблокирована!",
        description: `Наслаждайтесь ${translatedTitles[reward.title]?.toLowerCase() || reward.title.toLowerCase()} в течение ${reward.duration} минут.`,
      });
      
      // Start countdown timer
      startTimer(reward.duration * 60); // Convert minutes to seconds
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось разблокировать награду.",
        variant: "destructive",
      });
    }
  });

  const unlockReward = () => {
    if (coins < reward.coinCost) {
      toast({
        title: "Недостаточно монет",
        description: `Вам нужно ${reward.coinCost} монет для разблокировки этой награды.`,
        variant: "destructive",
      });
      return;
    }
    
    const success = subtractCoins(reward.coinCost);
    if (success) {
      unlockMutation.mutate(reward.id);
    }
  };

  const startTimer = (seconds: number) => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    setTimeLeft(seconds);
    const id = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(id);
          setIntervalId(null);
          toast({
            title: "Время вышло!",
            description: `Ваше время на ${translatedTitles[reward.title]?.toLowerCase() || reward.title.toLowerCase()} закончилось.`,
          });
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    setIntervalId(id);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Map icon names to components
  const iconMap: Record<string, React.ReactNode> = {
    "gamepad": <Gamepad className="h-5 w-5" />,
    "movie": <Clapperboard className="h-5 w-5" />,
    "instagram": <Instagram className="h-5 w-5" />,
    "youtube": <Youtube className="h-5 w-5" />,
    "coffee": <Coffee className="h-5 w-5" />,
    "music": <Music className="h-5 w-5" />
  };

  return (
    <div className="reward-card bg-white rounded-xl p-4 shadow-md border border-gray-100">
      <div className="flex justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mr-4 text-accent">
            {iconMap[reward.icon] || <Gamepad className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{translatedTitles[reward.title] || reward.title}</h3>
            <p className="text-sm text-gray-500">{translatedDescriptions[reward.description] || reward.description}</p>
          </div>
        </div>
        
        {timeLeft !== null ? (
          <div className="flex items-center px-4 py-2 bg-secondary/10 text-secondary rounded-lg font-medium">
            <Timer className="h-4 w-4 mr-2" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="game-button shadow-button bg-accent text-white py-2 px-4 rounded-lg font-medium flex items-center"
                      disabled={isPending || unlockMutation.isPending || coins < reward.coinCost}
                    >
                      <svg className="h-4 w-4 mr-2 text-accent-foreground" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        <path d="M18.7 12c0-.1 0-.2-.1-.3l-1.4-2.4c-.2-.3-.2-.7-.1-1.1l.6-2.5c.1-.4-.1-.8-.4-1.1s-.7-.4-1.1-.3l-2.6.6c-.4.1-.8 0-1.1-.2l-2.3-1.5c-.3-.1-.6-.1-.9 0l-2.3 1.5c-.3.2-.7.3-1.1.2L3.3 4.3c-.4-.1-.8 0-1.1.3s-.5.7-.4 1.1l.6 2.5c.1.4.1.7-.1 1.1L.9 11.7c-.2.3-.2.6-.1.9l1.4 2.4c.2.3.2.7.1 1.1l-.6 2.5c-.1.4.1.8.4 1.1s.7.4 1.1.3l2.6-.6c.4-.1.8 0 1.1.2l2.3 1.5c.3.2.7.2 1 0l2.3-1.5c.3-.2.7-.3 1.1-.2l2.6.6c.4.1.8 0 1.1-.3s.5-.7.4-1.1l-.6-2.5c-.1-.4-.1-.7.1-1.1l1.4-2.4c.3-.3.3-.6.2-.9z" />
                      </svg>
                      {reward.coinCost}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-gray-100">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl">Разблокировать {translatedTitles[reward.title] || reward.title}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это будет стоить вам {reward.coinCost} монет и даст вам {reward.duration} минут {translatedTitles[reward.title]?.toLowerCase() || reward.title.toLowerCase()}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-gray-200">Отмена</AlertDialogCancel>
                      <AlertDialogAction onClick={unlockReward} className="bg-primary text-white">Разблокировать</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Потратить {reward.coinCost} монет на {reward.duration} минут</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
