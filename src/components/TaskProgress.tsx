import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Activity, CheckSquare, CalendarClock, BarChart3, CheckCircle } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';

export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export const TaskProgress: React.FC = () => {
  const { tasks } = useTasks();
  
  const [stats, setStats] = useState<TaskStatistics>({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    completionRate: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStatistics = () => {
      try {
        setLoading(true);
        
        // คำนวณสถิติ
        const now = new Date();
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const overdueTasks = tasks.filter(task => 
          !task.completed && 
          task.dueDate && 
          new Date(task.dueDate) < now
        ).length;
        
        const completionRate = totalTasks > 0 
          ? (completedTasks / totalTasks) * 100 
          : 0;
        
        setStats({
          totalTasks,
          completedTasks,
          overdueTasks,
          completionRate
        });
        
      } catch (error) {
        console.error('Error calculating task statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    calculateStatistics();
  }, [tasks]);

  // คำนวณสีของเส้น progress bar ตามเปอร์เซ็นต์ความสำเร็จ
  const getProgressColor = () => {
    if (stats.completionRate >= 75) return "bg-green-500";
    if (stats.completionRate >= 50) return "bg-blue-500";
    if (stats.completionRate >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column - ความคืบหน้า */}
      <div className="md:col-span-1 space-y-6">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              ภาพรวมความคืบหน้า
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6 py-2">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>ความสำเร็จ</span>
                    <span className="font-medium">{stats.completionRate.toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={stats.completionRate} 
                    className="h-3 bg-slate-200"
                    indicatorClassName={getProgressColor()}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center shadow-sm">
                    <span className="text-4xl font-bold text-green-600">{stats.completedTasks}</span>
                    <span className="text-sm text-muted-foreground">งานที่เสร็จแล้ว</span>
                  </div>
                  <div className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center shadow-sm">
                    <span className="text-4xl font-bold text-amber-600">{stats.totalTasks - stats.completedTasks}</span>
                    <span className="text-sm text-muted-foreground">งานที่ยังไม่เสร็จ</span>
                  </div>
                </div>
                
                <div className="pt-2 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" /> 
                      อัตราส่วนความสำเร็จ
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {stats.completedTasks} จาก {stats.totalTasks} งาน
                    </span>
                  </div>
                  
                  <div className="w-full h-3 bg-slate-200 rounded-full mt-2">
                    <div 
                      className="h-3 rounded-full bg-blue-500" 
                      style={{ width: `${stats.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Right Column - สถิติ */}
      <div className="md:col-span-1 space-y-6">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              สถิติงาน
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6 py-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-100 dark:bg-slate-800 p-3 rounded-lg flex flex-col items-center text-center shadow-sm">
                    <CheckSquare className="h-6 w-6 text-blue-500 mb-1" />
                    <p className="text-xs text-muted-foreground">ทั้งหมด</p>
                    <p className="text-xl font-bold">{stats.totalTasks}</p>
                  </div>
                  
                  <div className="bg-amber-100 dark:bg-slate-800 p-3 rounded-lg flex flex-col items-center text-center shadow-sm">
                    <CalendarClock className="h-6 w-6 text-amber-500 mb-1" />
                    <p className="text-xs text-muted-foreground">เลยกำหนด</p>
                    <p className="text-xl font-bold">{stats.overdueTasks}</p>
                  </div>
                  
                  <div className="bg-emerald-100 dark:bg-slate-800 p-3 rounded-lg flex flex-col items-center text-center shadow-sm">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mb-1" />
                    <p className="text-xs text-muted-foreground">เสร็จสิ้น</p>
                    <p className="text-xl font-bold">{stats.completedTasks}</p>
                  </div>
                </div>
                
                {/* แสดงอัตราการเสร็จสิ้นงาน */}
                <div className="col-span-3 mt-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">อัตราการเสร็จสิ้น</p>
                      <p className="text-sm font-semibold">{stats.completionRate.toFixed(0)}%</p>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${stats.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskProgress; 