
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Category } from "@/types/category";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(() => {
    const storedCategories = localStorage.getItem("categories");
    return storedCategories ? JSON.parse(storedCategories) : [];
  });

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      id: uuidv4(),
      name: category.name
    };

    setCategories([...categories, newCategory]);
    return newCategory;
  };

  const updateCategory = (
    id: string,
    updates: Omit<Category, "id">
  ) => {
    setCategories(
      categories.map(category =>
        category.id === id
          ? {
              ...category,
              ...updates
            }
          : category
      )
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  return {
    categories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory
  };
}
