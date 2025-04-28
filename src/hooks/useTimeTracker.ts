import { useCallback } from 'react';
import { useTasks } from './useTasks';
import { useToast } from '@/components/ui/use-toast';

// สร้าง timer tracker สำหรับแอปพลิเคชัน แต่ไม่มีฟังก์ชั่นจับเวลา
export function useTimeTracker() {
  const { toast } = useToast();
  const { getTaskById, updateTask } = useTasks();

  // แปลงวินาทีเป็นรูปแบบ HH:MM:SS
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // คืนค่าแบบคงที่เพื่อให้ interface เหมือนเดิม
  return {
    isRunning: false,
    currentTaskId: null,
    elapsedTime: 0,
    formatTime,
    startTimer: useCallback(() => {}, []),
    pauseTimer: useCallback(() => {}, []),
    resetTimer: useCallback(() => {}, []),
    stopAndMarkAsCompleted: useCallback((taskId: string) => {
      const task = getTaskById(taskId);
      if (!task) return;
      
      // อัพเดทสถานะงาน
      updateTask(taskId, {
        completed: true
      });
      
      toast({
        title: "งานเสร็จสิ้น",
        description: `งาน "${task.title}" เสร็จสิ้นแล้ว`,
      });
    }, [getTaskById, updateTask, toast]),
    getRealtimeElapsed: useCallback((taskId: string) => {
      const task = getTaskById(taskId);
      return task?.elapsedTime || 0;
    }, [getTaskById])
  };
} 