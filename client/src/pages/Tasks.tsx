import { useQuery } from "@tanstack/react-query";
import TaskList from "@/components/tasks/TaskList";
import TaskForm from "@/components/tasks/TaskForm";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface TasksProps {
  userId: number;
}

export default function Tasks({ userId }: TasksProps) {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: [`/api/user/${userId}/tasks`],
  });

  const activeTasks = tasks.filter(task => !task.isCompleted);
  const completedTasks = tasks.filter(task => task.isCompleted);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
        <TaskForm userId={userId} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="active" className="font-nunito">
              Active ({activeTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="font-nunito">
              Completed ({completedTasks.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {activeTasks.length > 0 ? (
              <TaskList tasks={activeTasks} userId={userId} showCompleted={false} />
            ) : (
              <Card className="p-6 text-center text-gray-500">
                No active tasks. Add a new task to get started!
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {completedTasks.length > 0 ? (
              <TaskList tasks={completedTasks} userId={userId} />
            ) : (
              <Card className="p-6 text-center text-gray-500">
                No completed tasks yet. Complete some tasks to see them here!
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
