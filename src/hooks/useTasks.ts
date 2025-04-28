import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Task } from "@/types/task";

const TASKS_STORAGE_KEY = "tasks";

export function useTasks() {
  // Function to load tasks from localStorage
  const loadTasksFromStorage = useCallback(() => {
    try {
      const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      console.log("Loading tasks from localStorage:", storedTasks);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks)) {
          return parsedTasks;
        }
      }
      return [];
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }, []);

  const [tasks, setTasks] = useState<Task[]>(loadTasksFromStorage);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    try {
      console.log("Saving tasks to localStorage:", tasks);
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  }, [tasks]);

  const getTaskById = useCallback((id: string) => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  const addTask = useCallback((task: Omit<Task, "id" | "completed" | "createdAt">) => {
    try {
      console.log("Adding new task:", task);
      const newTask: Task = {
        id: uuidv4(),
        title: task.title,
        description: task.description || "",
        completed: false,
        priority: task.priority || "medium",
        dueDate: task.dueDate || null,
        categoryId: task.categoryId,
        createdAt: new Date().toISOString()
      };

      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks, newTask];
        console.log("Updated tasks after adding:", updatedTasks);
        // Force immediate save to localStorage
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
        return updatedTasks;
      });
      
      return newTask;
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  }, []);

  const toggleTaskCompletion = (id: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === id) {
          return { ...task, completed: !task.completed, updatedAt: new Date().toISOString() };
        }
        return task;
      });
      
      // บันทึกลง localStorage โดยตรง
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
      return updatedTasks;
    });
  };

  return {
    tasks,
    getTaskById,
    addTask,
    updateTask: useCallback((
      id: string,
      updates: Partial<Omit<Task, "id" | "completed" | "createdAt">>
    ) => {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task =>
          task.id === id
            ? {
                ...task,
                ...updates
              }
            : task
        );
        // Force immediate save to localStorage
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
        return updatedTasks;
      });
    }, []),
    toggleTaskCompletion,
    deleteTask: useCallback((id: string) => {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.filter(task => task.id !== id);
        // Force immediate save to localStorage
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
        return updatedTasks;
      });
    }, [])
  };
} 