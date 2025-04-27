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
import { CalendarIcon, Clock, ChevronUp, ChevronDown, Bell, Timer, Play, Pause, RotateCcw } from "lucide-react";
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
import { v4 as uuidv4 } from 'uuid';
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
  
  // Time tracking feature
  const [estimatedTime, setEstimatedTime] = useState('');
  const [timeTrackingEnabled, setTimeTrackingEnabled] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isEditMode && taskId) {
      const task = getTaskById(taskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        task.dueDate && setDueDate(new Date(task.dueDate));
        setPriority(task.priority as 'low' | 'medium' | 'high');
        setCategoryId(task.categoryId || 'none');
        
        // Set time tracking data if exists
        if (task.estimatedTime) {
          setEstimatedTime(task.estimatedTime);
          setTimeTrackingEnabled(true);
        }
        if (task.elapsedTime) {
          setElapsedTime(task.elapsedTime);
        }
      }
    }
  }, [taskId, isEditMode, getTaskById]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const handleDateSelect = (date: Date | undefined) => {
    setDueDate(date);
    setCalendarOpen(false);
  };

  // Format time from seconds to HH:MM:SS
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Timer controls
  const startTimer = () => {
    if (isTimerRunning) return;
    
    setIsTimerRunning(true);
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
    
    toast({
      title: "เริ่มจับเวลาแล้ว",
      description: "ระบบกำลังบันทึกเวลาทำงานของคุณ",
    });
  };
  
  const pauseTimer = () => {
    if (!isTimerRunning) return;
    
    setIsTimerRunning(false);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    toast({
      title: "หยุดจับเวลาชั่วคราว",
      description: `เวลาทำงานสะสม: ${formatTime(elapsedTime)}`,
    });
  };
  
  const resetTimer = () => {
    if (isTimerRunning && timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    setIsTimerRunning(false);
    setElapsedTime(0);
    
    toast({
      title: "รีเซ็ตเวลาเรียบร้อย",
      description: "ระบบได้รีเซ็ตเวลาทำงานเป็นศูนย์แล้ว",
    });
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
        // Time tracking data
        estimatedTime: timeTrackingEnabled ? estimatedTime : undefined,
        elapsedTime: timeTrackingEnabled ? elapsedTime : undefined,
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
      
      // ถ้ามีการจับเวลาอยู่ ให้หยุดการจับเวลา
      if (isTimerRunning && timerInterval) {
        clearInterval(timerInterval);
      }
      
      // Use setTimeout to ensure state updates before navigation
      setTimeout(() => {
        navigate("/tasks");
      }, 100);
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="estimatedTime" className="text-sm font-medium">
                    เวลาที่คาดว่าจะใช้
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableTimeTracking"
                      checked={timeTrackingEnabled}
                      onChange={(e) => setTimeTrackingEnabled(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="enableTimeTracking" className="text-xs">เปิดใช้งาน</label>
                  </div>
                </div>
                
                <Input
                  id="estimatedTime"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="เช่น 2 ชั่วโมง, 30 นาที"
                  disabled={!timeTrackingEnabled}
                />
              </div>
            </div>
            
            {timeTrackingEnabled && (
              <div className="border rounded-lg bg-background dark:bg-background">
                <div className="flex flex-col">
                  <div className="flex flex-col items-center py-6 border-b">
                    <h3 className="text-base font-medium flex items-center mb-4 text-foreground dark:text-foreground">
                      <Timer className="w-4 h-4 mr-2" /> 
                      ระบบติดตามเวลาทำงาน
                    </h3>
                    <div className="text-4xl font-mono font-bold text-foreground dark:text-foreground">
                      {formatTime(elapsedTime)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-px bg-border dark:bg-border">
                    <Button 
                      type="button"
                      onClick={startTimer}
                      disabled={isTimerRunning}
                      className="rounded-none bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white h-14"
                    >
                      <Play className="w-5 h-5" />
                    </Button>
                    <Button 
                      type="button"
                      onClick={pauseTimer}
                      disabled={!isTimerRunning}
                      className="rounded-none bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white h-14"
                    >
                      <Pause className="w-5 h-5" />
                    </Button>
                    <Button 
                      type="button"
                      onClick={resetTimer}
                      className="rounded-none bg-zinc-600 hover:bg-zinc-700 text-white dark:bg-zinc-600 dark:hover:bg-zinc-700 dark:text-white h-14"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted dark:bg-muted rounded-md">
                      <span className="text-sm text-muted-foreground dark:text-muted-foreground">เวลาที่คาดว่าจะใช้</span>
                      <span className="font-mono text-foreground dark:text-foreground">{estimatedTime || "1 นาที"}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted dark:bg-muted rounded-md">
                      <span className="text-sm text-muted-foreground dark:text-muted-foreground">เวลาที่ใช้ไป</span>
                      <span className="font-mono text-foreground dark:text-foreground">{formatTime(elapsedTime)}</span>
                    </div>
                  </div>
                  
                  <div className="px-4 pb-4">
                    <p className="text-xs text-center text-muted-foreground dark:text-muted-foreground">
                      เวลาทำงานจะถูกบันทึกอัตโนมัติเมื่อคุณบันทึกงาน
                    </p>
                  </div>
                </div>
              </div>
            )}
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
