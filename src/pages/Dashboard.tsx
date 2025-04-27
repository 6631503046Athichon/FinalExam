import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ListChecks, BarChart, Play, Pause, Timer, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTaskStats } from "@/hooks/useTaskStats";
import { useTasks } from "@/hooks/useTasks";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import TaskProgress from "@/components/TaskProgress";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { completed, pending, total } = useTaskStats();
  const { tasks } = useTasks();
  const { isRunning, currentTaskId, startTimer, pauseTimer, formatTime, getRealtimeElapsed } = useTimeTracker();
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [elapsedTimeDisplay, setElapsedTimeDisplay] = useState("00:00:00");

  // หางานที่กำลังจับเวลาอยู่และงานล่าสุด
  useEffect(() => {
    // หางานที่กำลังจับเวลา
    if (isRunning && currentTaskId) {
      const taskRunning = tasks.find(t => t.id === currentTaskId);
      setCurrentTask(taskRunning);
    } else {
      setCurrentTask(null);
    }

    // ดึงงานล่าสุด 3 งานที่ยังไม่เสร็จ
    const latestPendingTasks = tasks
      .filter(task => !task.completed)
      .sort((a, b) => {
        // เรียงตามวันครบกำหนด (ถ้ามี) หรือวันที่สร้าง
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date(a.createdAt);
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date(b.createdAt);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3);
    
    setRecentTasks(latestPendingTasks);
  }, [tasks, isRunning, currentTaskId]);

  // อัพเดทเวลาที่แสดงทุกวินาที
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && currentTaskId) {
      interval = setInterval(() => {
        const time = getRealtimeElapsed(currentTaskId);
        setElapsedTimeDisplay(formatTime(time));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentTaskId, getRealtimeElapsed, formatTime]);

  // เริ่มจับเวลางานล่าสุด
  const handleStartLatestTask = () => {
    if (recentTasks.length > 0 && !isRunning) {
      const latestTask = recentTasks[0];
      startTimer(latestTask.id, latestTask.elapsedTime || 0);
    }
  };

  // หยุดจับเวลางานปัจจุบัน
  const handlePauseCurrentTask = () => {
    if (isRunning) {
      pauseTimer();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">สวัสดี!</h1>
        <p className="text-muted-foreground text-xl">ยินดีต้อนรับกลับมา นี่คือภาพรวมงานของคุณ</p>
      </div>

      {/* ส่วนแสดงงานที่กำลังจับเวลา */}
      {currentTask ? (
        <Card className="mb-8 border-green-400 dark:border-green-500 shadow-md">
          <CardHeader className="bg-green-50 dark:bg-green-900/20 pb-2">
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Timer className="text-green-600 dark:text-green-400" />
              กำลังจับเวลางาน
            </CardTitle>
            <CardDescription>
              คุณกำลังจับเวลาสำหรับงานนี้
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{currentTask.title}</h3>
                {currentTask.dueDate && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <Clock className="h-3.5 w-3.5 inline mr-1" />
                    กำหนดส่ง: {new Date(currentTask.dueDate).toLocaleDateString('th-TH')}
                  </p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <Badge 
                    className={
                      currentTask.priority === "high" ? "bg-red-500" : 
                      currentTask.priority === "medium" ? "bg-orange-500" : 
                      "bg-blue-500"
                    }
                  >
                    {currentTask.priority === "high" ? "สูง" : 
                     currentTask.priority === "medium" ? "ปานกลาง" : 
                     "ต่ำ"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-4xl font-mono font-bold text-green-600 dark:text-green-400 mb-2">
                  {elapsedTimeDisplay}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePauseCurrentTask}
                    variant="outline" 
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    หยุดชั่วคราว
                  </Button>
                  <Button asChild variant="outline">
                    <Link to={`/tasks/edit/${currentTask.id}`}>
                      แก้ไขงาน
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : recentTasks.length > 0 ? (
        <Card className="mb-8 border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20 pb-2">
            <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Play className="text-blue-600 dark:text-blue-400" />
              เริ่มจับเวลางานล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{recentTasks[0].title}</h3>
                {recentTasks[0].dueDate && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <Clock className="h-3.5 w-3.5 inline mr-1" />
                    กำหนดส่ง: {new Date(recentTasks[0].dueDate).toLocaleDateString('th-TH')}
                  </p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <Badge 
                    className={
                      recentTasks[0].priority === "high" ? "bg-red-500" : 
                      recentTasks[0].priority === "medium" ? "bg-orange-500" : 
                      "bg-blue-500"
                    }
                  >
                    {recentTasks[0].priority === "high" ? "สูง" : 
                     recentTasks[0].priority === "medium" ? "ปานกลาง" : 
                     "ต่ำ"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Button 
                  onClick={handleStartLatestTask}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  เริ่มจับเวลางานนี้
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="text-primary" />
              ทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Clock className="text-orange-500" />
              รอดำเนินการ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{pending}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="text-green-500" />
              เสร็จสิ้น
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{completed}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="text-primary" />
              รายงานความก้าวหน้า
            </CardTitle>
            <CardDescription>สถิติและการวิเคราะห์งานของคุณ</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskProgress />
          </CardContent>
        </Card>
      </div>

      {/* งานที่ต้องทำล่าสุด (ถ้าไม่ได้แสดงในส่วนเริ่มจับเวลา) */}
      {!currentTask && recentTasks.length > 1 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="text-orange-500" />
              งานที่ต้องทำเร็วๆ นี้
            </CardTitle>
            <CardDescription>งานที่มีกำหนดส่งใกล้ถึงและสำคัญ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.slice(1).map(task => (
                <div key={task.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        กำหนดส่ง: {new Date(task.dueDate).toLocaleDateString('th-TH')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        task.priority === "high" ? "bg-red-500" : 
                        task.priority === "medium" ? "bg-orange-500" : 
                        "bg-blue-500"
                      }
                    >
                      {task.priority === "high" ? "สูง" : 
                       task.priority === "medium" ? "ปานกลาง" : 
                       "ต่ำ"}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="flex items-center" 
                      onClick={() => startTimer(task.id, task.elapsedTime || 0)}
                    >
                      <Play className="h-3.5 w-3.5 mr-1" />
                      จับเวลา
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>จัดการงานของคุณ</CardTitle>
          <CardDescription>ดูรายการงานทั้งหมดหรือเพิ่มงานใหม่</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium mb-2">รายการงานทั้งหมด</h3>
            <p className="text-muted-foreground mb-4">ดูและจัดการงานทั้งหมดของคุณในที่เดียว</p>
            <Button asChild className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/tasks">ดูรายการงาน</Link>
            </Button>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">เพิ่มงานใหม่</h3>
            <p className="text-muted-foreground mb-4">เริ่มสร้างงานใหม่ได้ทันที</p>
            <Button asChild className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/tasks/new">เพิ่มงานใหม่</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>หมวดหมู่</CardTitle>
          <CardDescription>จัดกลุ่มและแสดงงานตามหมวดหมู่</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">จัดระเบียบงานของคุณด้วยหมวดหมู่ เพื่อการจัดการงานที่มีประสิทธิภาพยิ่งขึ้น</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/categories">จัดการหมวดหมู่</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
