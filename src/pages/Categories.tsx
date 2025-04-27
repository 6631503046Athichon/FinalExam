import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTasks } from "@/hooks/useTasks";

const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { tasks } = useTasks();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory({ name: newCategoryName.trim() });
      setNewCategoryName("");
      toast({
        title: "เพิ่มหมวดหมู่สำเร็จ",
        description: "หมวดหมู่ใหม่ถูกเพิ่มเรียบร้อยแล้ว",
      });
    }
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory && editingCategory.name.trim()) {
      updateCategory(editingCategory.id, { name: editingCategory.name.trim() });
      setEditingCategory(null);
      toast({
        title: "แก้ไขหมวดหมู่สำเร็จ",
        description: "หมวดหมู่ถูกอัพเดทเรียบร้อยแล้ว",
      });
    }
  };

  const handleDeleteCategory = (id: string) => {
    const tasksInCategory = tasks.filter(task => task.categoryId === id).length;
    
    if (tasksInCategory > 0) {
      toast({
        title: "ไม่สามารถลบหมวดหมู่ได้",
        description: `มี ${tasksInCategory} งานที่อยู่ในหมวดหมู่นี้ กรุณาย้ายหรือลบงานก่อน`,
        variant: "destructive",
      });
      return;
    }
    
    deleteCategory(id);
    toast({
      title: "ลบหมวดหมู่สำเร็จ",
      description: "หมวดหมู่ถูกลบออกเรียบร้อยแล้ว",
      variant: "destructive",
    });
  };

  const getCategoryTaskCount = (categoryId: string) => {
    return tasks.filter(task => task.categoryId === categoryId).length;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">จัดการหมวดหมู่</h1>
        <p className="text-muted-foreground">จัดกลุ่มงานของคุณด้วยหมวดหมู่ เพื่อการจัดการงานที่มีประสิทธิภาพยิ่งขึ้น</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>เพิ่มหมวดหมู่ใหม่</CardTitle>
          <CardDescription>สร้างหมวดหมู่ใหม่เพื่อจัดระเบียบงานของคุณ</CardDescription>
        </CardHeader>
        <form onSubmit={handleAddCategory}>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="ชื่อหมวดหมู่"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="flex items-center gap-2">
                <Plus size={18} />
                เพิ่ม
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      <h2 className="text-2xl font-bold mb-4">หมวดหมู่ทั้งหมด</h2>
      
      {categories.length > 0 ? (
        <div className="space-y-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => setEditingCategory({ id: category.id, name: category.name })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  งานในหมวดหมู่นี้: {getCategoryTaskCount(category.id)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">ยังไม่มีหมวดหมู่ กรุณาเพิ่มหมวดหมู่ใหม่</p>
        </Card>
      )}
      
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขหมวดหมู่</DialogTitle>
            <DialogDescription>
              กรุณาระบุชื่อหมวดหมู่ที่ต้องการแก้ไข
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <form onSubmit={handleUpdateCategory}>
              <div className="py-4">
                <Input
                  placeholder="ชื่อหมวดหมู่"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" className="dark:bg-white dark:text-black bg-black text-white" onClick={() => setEditingCategory(null)}>
                  ยกเลิก
                </Button>
                <Button type="submit">
                  บันทึก
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
