import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTaskSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaskFormProps {
  userId: number;
}

const taskFormSchema = insertTaskSchema
  .extend({
    dueDate: z.date().optional(),
  })
  .omit({ userId: true });

type TaskFormData = z.infer<typeof taskFormSchema>;

export default function TaskForm({ userId }: TaskFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      coinReward: 10,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const payload = {
        ...data,
        userId,
      };
      return await apiRequest("POST", "/api/tasks", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}/tasks`] });
      toast({
        title: "Задача создана",
        description: "Ваша новая задача была успешно создана.",
      });
      form.reset();
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать задачу. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: TaskFormData) {
    createMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="game-button shadow-button bg-primary text-white rounded-full p-3 h-auto w-auto">
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] border-gray-100">
        <DialogHeader>
          <DialogTitle className="text-xl">Создать новую задачу</DialogTitle>
          <DialogDescription>
            Добавьте новую задачу и установите награду за её выполнение.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название задачи</FormLabel>
                  <FormControl>
                    <Input placeholder="Что нужно сделать?" {...field} className="border-gray-200 focus-visible:ring-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание (опционально)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Добавьте подробности о задаче..."
                      {...field}
                      className="border-gray-200 focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Срок выполнения (опционально)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal border-gray-200",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd MMMM yyyy", { locale: ru })
                          ) : (
                            <span>Выберите дату</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coinReward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Награда в монетах</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="pl-10 border-gray-200 focus-visible:ring-primary"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Coins className="h-4 w-4 text-accent" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-gray-200"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="game-button shadow-button bg-primary text-white"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Создание..." : "Создать задачу"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
