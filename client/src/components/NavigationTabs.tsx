import { Link } from "wouter";
import { LayoutDashboard, Gift, Brain, CheckSquare } from "lucide-react";

interface NavigationTabsProps {
  currentPath: string;
}

export default function NavigationTabs({ currentPath }: NavigationTabsProps) {
  const tabs = [
    { path: "/", label: "Дашборд", icon: LayoutDashboard },
    { path: "/tasks", label: "Задачи", icon: CheckSquare },
    { path: "/rewards", label: "Награды", icon: Gift },
    { path: "/mini-games", label: "Мини-игры", icon: Brain },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-10">
      <div className="container mx-auto">
        <div className="flex font-nunito font-semibold text-sm md:text-base">
          {tabs.map((tab) => {
            const isActive = currentPath === tab.path;
            const Icon = tab.icon;
            
            return (
              <Link key={tab.path} href={tab.path}>
                <div className={`flex-1 py-4 flex flex-col items-center cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-primary hover:bg-gray-50"
                }`}>
                  <Icon className={`${isActive ? "h-6 w-6" : "h-5 w-5"} mb-1 transition-all duration-200`} />
                  <span>{tab.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
