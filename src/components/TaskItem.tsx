import { useState } from "react";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Calendar, Timer } from "lucide-react";
import { format } from "date-fns";
import { Task } from "@/types/task";
import { useCategories } from "@/hooks/useCategories";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem = ({ task, onToggleComplete, onDelete }: TaskItemProps) => {
  const { getCategoryById } = useCategories();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 hover:bg-red-600";
      case "medium":
        return "bg-orange-500 hover:bg-orange-600";
      case "low":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };
  
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "สูง";
      case "medium":
        return "ปานกลาง";
      case "low":
        return "ต่ำ";
      default:
        return "ไม่ระบุ";
    }
  };
  
  // ฟังก์ชันสำหรับแปลงวินาทีเป็นรูปแบบเวลาที่อ่านง่าย
  const formatTime = (seconds: number | null | undefined): string => {
    if (!seconds) return "";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ชม. ${minutes > 0 ? `${minutes} นาที` : ''}`;
    }
    return `${minutes} นาที`;
  };
  
  const category = task.categoryId ? getCategoryById(task.categoryId) : null;

  return (
    <Card className={`${task.completed ? "opacity-70" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task.id)}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
              <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {category && (
                  <Badge variant="outline" className="hidden sm:inline-flex">
                    {category.name}
                  </Badge>
                )}
                <Badge className={getPriorityColor(task.priority)}>
                  {getPriorityLabel(task.priority)}
                </Badge>
              </div>
            </div>

            {task.description && (
              <p className={`text-sm ${task.completed ? "text-muted-foreground" : ""} mb-2`}>
                {task.description}
              </p>
            )}
            
            {category && (
              <Badge variant="outline" className="sm:hidden mb-2">
                {category.name}
              </Badge>
            )}
            
            {/* แสดงข้อมูลการติดตามเวลา */}
            {(task.estimatedTime || task.elapsedTime) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1 mb-2">
                {task.estimatedTime && (
                  <span className="flex items-center">
                    <Timer className="h-3 w-3 mr-1 text-blue-500" />
                    คาดการณ์: {task.estimatedTime}
                  </span>
                )}
                {task.elapsedTime && task.elapsedTime > 0 && (
                  <span className="flex items-center">
                    <Timer className="h-3 w-3 mr-1 text-green-500" />
                    ใช้เวลาไป: {formatTime(task.elapsedTime)}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between mt-2">
              {task.dueDate ? (
                <span className={`text-xs flex items-center ${task.completed ? "text-muted-foreground" : "text-muted-foreground"}`}>
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(task.dueDate), "dd/MM/yyyy")}
                </span>
              ) : (
                <span></span>
              )}

              <div className="flex gap-1">
                <Button asChild size="sm" variant="ghost">
                  <Link to={`/tasks/edit/${task.id}`}>
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    แก้ไข
                  </Link>
                </Button>
                
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      ลบ
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                      <AlertDialogDescription>
                        การดำเนินการนี้จะลบงาน "{task.title}" และไม่สามารถกู้คืนได้
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          onDelete(task.id);
                          setIsDeleteDialogOpen(false);
                        }}
                      >
                        ลบ
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskItem;
