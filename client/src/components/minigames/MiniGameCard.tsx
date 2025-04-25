import { Brain, Zap, BookOpen } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MemoryGame from "./MemoryGame";
import ReactionGame from "./ReactionGame";

interface MiniGameCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  maxCoins: number;
  gameType: "memory" | "reaction";
}

export default function MiniGameCard({ 
  title, 
  description, 
  icon, 
  color, 
  maxCoins, 
  gameType 
}: MiniGameCardProps) {
  const [open, setOpen] = useState(false);

  // Map colors to tailwind classes
  const colorClasses = {
    primary: {
      bg: "from-primary-light to-primary",
      text: "text-primary",
      badge: "bg-primary/10 text-primary",
    },
    secondary: {
      bg: "from-secondary-light to-secondary",
      text: "text-secondary",
      badge: "bg-secondary/10 text-secondary",
    },
    accent: {
      bg: "from-accent-light to-accent",
      text: "text-accent",
      badge: "bg-accent/10 text-accent",
    },
  };

  // Map icon strings to components
  const iconMap: Record<string, React.ReactNode> = {
    "Brain": <Brain className="h-10 w-10 text-white" />,
    "Zap": <Zap className="h-10 w-10 text-white" />,
    "BookOpen": <BookOpen className="h-10 w-10 text-white" />,
  };

  const classes = colorClasses[color as keyof typeof colorClasses];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="minigame-card bg-white rounded-xl overflow-hidden shadow-md cursor-pointer">
          <div className="flex">
            <div className={`w-1/3 bg-gradient-to-br ${classes.bg} p-3 flex items-center justify-center`}>
              {iconMap[icon]}
            </div>
            <div className="w-2/3 p-4">
              <h3 className="font-medium font-nunito">{title}</h3>
              <p className="text-sm text-gray-500 mb-2">{description}</p>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${classes.badge} px-2 py-1 rounded-full`}>
                  Earn up to {maxCoins} coins
                </span>
                <button className={`${classes.text} hover:opacity-80 font-medium text-sm`}>
                  Play
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="p-4 bg-gray-50">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}. You can earn up to {maxCoins} coins.
          </DialogDescription>
        </DialogHeader>
        
        {gameType === "memory" && <MemoryGame onClose={() => setOpen(false)} />}
        {gameType === "reaction" && <ReactionGame onClose={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}
