import { Link } from "wouter";
import { PanelsTopLeft, Gift, Brain, Check } from "lucide-react";

interface NavigationTabsProps {
  currentPath: string;
}

export default function NavigationTabs({ currentPath }: NavigationTabsProps) {
  const tabs = [
    { path: "/", label: "PanelsTopLeft", icon: PanelsTopLeft },
    { path: "/tasks", label: "Tasks", icon: Check },
    { path: "/rewards", label: "Rewards", icon: Gift },
    { path: "/mini-games", label: "Mini-Games", icon: Brain },
  ];

  return (
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto">
        <div className="flex font-nunito font-semibold text-sm md:text-base">
          {tabs.map((tab) => {
            const isActive = currentPath === tab.path;
            const Icon = tab.icon;
            
            return (
              <Link key={tab.path} href={tab.path}>
                <a className={`flex-1 py-4 flex flex-col items-center ${
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-primary"
                }`}>
                  <Icon className="h-5 w-5 mb-1" />
                  <span>{tab.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
