import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';

const TaskForm = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const isEditMode = !!taskId;
  const currentTaskId = taskId || `task-${Date.now()}`;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tasks, addTask, updateTask, getTaskById } = useTasks();
  const { categories } = useCategories();

  // Task fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [categoryId, setCategoryId] = useState('none');
  
  // Calendar state
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (isEditMode && taskId) {
      const task = getTaskById(taskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        task.dueDate && setDueDate(new Date(task.dueDate));
        setPriority(task.priority as 'low' | 'medium' | 'high');
        setCategoryId(task.categoryId || 'none');
      }
    }
  }, [taskId, isEditMode, getTaskById]);

  const handleDateSelect = (date: Date | undefined) => {
    setDueDate(date);
    setCalendarOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ตรวจสอบชื่องาน
      if (!title.trim()) {
        toast({
          title: "กรุณากรอกชื่องาน",
          description: "ชื่องานไม่สามารถเว้นว่างได้",
          variant: "destructive",
        });
        return;
      }

      // สร้างข้อมูลงาน
      const taskData = {
        title: title.trim(),
        description: description.trim() || "",
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: dueDate ? dueDate.toISOString() : null,
        priority,
        categoryId: categoryId === 'none' ? undefined : categoryId,
      };

      if (isEditMode && taskId) {
        // อัพเดทงาน
        const oldTask = getTaskById(taskId);
        if (oldTask) {
          updateTask(taskId, {
            ...oldTask,
            ...taskData
          });
        }
        toast({
          title: "อัพเดตงานเรียบร้อย",
          description: `งาน "${title}" ถูกอัพเดตแล้ว`,
        });
      } else {
        // เพิ่มงานใหม่
        const newTask = addTask(taskData);
        toast({
          title: "เพิ่มงานเรียบร้อย",
          description: `งาน "${title}" ถูกเพิ่มเรียบร้อยแล้ว`,
        });
      }
      
      navigate("/tasks");
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกงานได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "แก้ไขงาน" : "เพิ่มงานใหม่"}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                ชื่องาน <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="กรอกชื่องาน"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                รายละเอียด
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="กรอกรายละเอียดงาน"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  กำหนดส่ง
                </label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                      onClick={() => setCalendarOpen(true)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">
                  ความสำคัญ
                </label>
                <Select 
                  value={priority} 
                  onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกความสำคัญ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">ต่ำ</SelectItem>
                    <SelectItem value="medium">ปานกลาง</SelectItem>
                    <SelectItem value="high">สูง</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                หมวดหมู่
              </label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ไม่มีหมวดหมู่</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button 
              type="submit"
              size="lg"
              className="w-full"
            >
              {isEditMode ? "บันทึก" : "เพิ่มงาน"}
            </Button>
            <Button 
              type="button" 
              onClick={() => navigate("/tasks")}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              ยกเลิก
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default TaskForm;
