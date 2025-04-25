import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Gamepad, User } from "lucide-react";

interface HeaderProps {
  userId: number;
}

export default function Header({ userId }: HeaderProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/user/${userId}`],
  });

  return (
    <header className="bg-gradient-to-r from-primary to-primary-light shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <Gamepad className="text-white mr-2 h-7 w-7" />
            <h1 className="text-white font-nunito font-bold text-2xl">ФокусИгра</h1>
          </div>
        </Link>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-inner">
            <span className="coin text-xl text-accent mr-2">⭐</span>
            {isLoading ? (
              <Skeleton className="h-6 w-16 bg-primary-light/50" />
            ) : (
              <span className="text-white font-bold text-lg">{user?.coins || 0} монет</span>
            )}
          </div>
          
          <button className="rounded-full w-11 h-11 bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center shadow-inner">
            <User className="text-white h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
