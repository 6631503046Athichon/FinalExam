export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  categoryId?: string;
  createdAt: string;
  updatedAt?: string;
  estimatedTime?: string;
  elapsedTime?: number;
}
