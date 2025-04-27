import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import TaskItem from "@/components/TaskItem";
import { useTasks } from "@/hooks/useTasks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const TaskList = () => {
  const { tasks, toggleTaskCompletion, deleteTask } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Force reload tasks from localStorage on mount
  useEffect(() => {
    const loadTasksFromStorage = () => {
      try {
        const storedTasks = localStorage.getItem("tasks");
        console.log("Direct from localStorage:", storedTasks);
        
        if (storedTasks) {
          // Log that we found tasks in localStorage
          console.log("Found tasks in storage:", JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error("Error checking localStorage:", error);
      }
    };
    
    loadTasksFromStorage();
  }, []);

  console.log("Current tasks in TaskList:", tasks);

  const handleToggleComplete = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      // ถ้ายังไม่เสร็จ ให้ส่ง elapsedTime ล่าสุดไปด้วย
      toggleTaskCompletion(id, task.elapsedTime);
    } else {
      // ถ้า uncheck กลับมาเป็นไม่เสร็จ
      toggleTaskCompletion(id);
    }
    toast({
      title: "สถานะงานถูกอัพเดท",
      description: "สถานะของงานถูกเปลี่ยนเรียบร้อยแล้ว",
    });
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    toast({
      title: "ลบงานสำเร็จ",
      description: "งานถูกลบออกจากรายการเรียบร้อยแล้ว",
      variant: "destructive",
    });
  };
  
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "completed") return matchesSearch && task.completed;
    if (filterStatus === "pending") return matchesSearch && !task.completed;
    return matchesSearch;
  });

  console.log("Filtered tasks:", filteredTasks);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">รายการงานทั้งหมด</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/tasks/new" className="flex items-center gap-2">
              <Plus size={18} />
              เพิ่มงานใหม่
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ค้นหางาน..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={filterStatus}
          onValueChange={(value) => setFilterStatus(value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="กรองสถานะ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="completed">เสร็จสิ้น</SelectItem>
            <SelectItem value="pending">รอดำเนินการ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {Array.isArray(tasks) && tasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-2xl font-medium text-muted-foreground mb-2">ไม่พบรายการงาน</h3>
          <p className="mb-6">
            {searchQuery || filterStatus !== "all" 
              ? "ไม่พบงานที่ตรงตามการค้นหาหรือตัวกรอง ลองเปลี่ยนตัวเลือกดูนะ" 
              : "คุณยังไม่มีงานในรายการ เพิ่มงานใหม่เลย!"}
          </p>
          {!searchQuery && filterStatus === "all" && (
            <Button asChild>
              <Link to="/tasks/new">เพิ่มงานแรกของคุณ</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;
