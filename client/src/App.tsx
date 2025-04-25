import { Switch, Route, useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Rewards from "@/pages/Rewards";
import MiniGames from "@/pages/MiniGames";
import Header from "@/components/Header";
import NavigationTabs from "@/components/NavigationTabs";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";

function App() {
  const [location] = useLocation();
  const [userId, setUserId] = useState<number>(1); // Default to the demo user

  // Fetch user data on app start
  useEffect(() => {
    const fetchUser = async () => {
      try {
        await queryClient.prefetchQuery({ 
          queryKey: [`/api/user/${userId}`] 
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    
    fetchUser();
  }, [userId]);

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <Header userId={userId} />
        <NavigationTabs currentPath={location} />
        
        <main className="flex-1 container mx-auto px-4 py-6">
          <Switch>
            <Route path="/" component={() => <Dashboard userId={userId} />} />
            <Route path="/tasks" component={() => <Tasks userId={userId} />} />
            <Route path="/rewards" component={() => <Rewards userId={userId} />} />
            <Route path="/mini-games" component={() => <MiniGames userId={userId} />} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </TooltipProvider>
  );
}

export default App;
