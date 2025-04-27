
import { useTasks } from "./useTasks";

export function useTaskStats() {
  const { tasks } = useTasks();

  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.filter(task => !task.completed).length;
  const total = tasks.length;

  return {
    completed,
    pending,
    total
  };
}
