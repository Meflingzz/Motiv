import { useQuery } from "@tanstack/react-query";
import TaskList from "@/components/tasks/TaskList";
import TaskForm from "@/components/tasks/TaskForm";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ListTodo } from "lucide-react";

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Мои задачи</h1>
          <p className="text-gray-500 text-sm">Управляйте своими задачами и получайте награды за их выполнение</p>
        </div>
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
          <TabsList className="grid grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="active" className="font-nunito data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md">
              <div className="flex items-center">
                <ListTodo className="mr-2 h-4 w-4" />
                Активные ({activeTasks.length})
              </div>
            </TabsTrigger>
            <TabsTrigger value="completed" className="font-nunito data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md">
              <div className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Выполненные ({completedTasks.length})
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {activeTasks.length > 0 ? (
              <TaskList tasks={activeTasks} userId={userId} showCompleted={false} />
            ) : (
              <Card className="p-8 text-center text-gray-500 border border-gray-100">
                <ListTodo className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p className="text-lg font-medium mb-2">Нет активных задач</p>
                <p>Добавьте новую задачу, чтобы начать</p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {completedTasks.length > 0 ? (
              <TaskList tasks={completedTasks} userId={userId} />
            ) : (
              <Card className="p-8 text-center text-gray-500 border border-gray-100">
                <CheckCircle2 className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p className="text-lg font-medium mb-2">Нет выполненных задач</p>
                <p>Выполните задачи, чтобы увидеть их здесь</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
