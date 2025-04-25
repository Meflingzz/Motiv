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
    <header className="bg-primary shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center">
            <Gamepad className="text-white mr-2 h-6 w-6" />
            <h1 className="text-white font-nunito font-bold text-2xl">GameFocus</h1>
          </a>
        </Link>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-primary-dark rounded-full px-3 py-1">
            <span className="coin text-xl text-accent mr-1">⭐</span>
            {isLoading ? (
              <Skeleton className="h-6 w-16 bg-primary-light/50" />
            ) : (
              <span className="text-white font-bold">{user?.coins || 0}</span>
            )}
          </div>
          
          <button className="rounded-full w-10 h-10 bg-primary-dark flex items-center justify-center">
            <User className="text-white h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
