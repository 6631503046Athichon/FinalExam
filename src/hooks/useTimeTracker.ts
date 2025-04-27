import { useState, useEffect, useCallback } from 'react';
import { useTasks } from './useTasks';
import { useToast } from '@/components/ui/use-toast';

type TimeTracker = {
  isRunning: boolean;
  taskId: string | null;
  startTime: number | null;
  elapsedTime: number;
};

// สร้าง timer tracker สำหรับแอปพลิเคชัน
export function useTimeTracker() {
  const { toast } = useToast();
  const { getTaskById, updateTask } = useTasks();
  const [tracker, setTracker] = useState<TimeTracker>({
    isRunning: false,
    taskId: null,
    startTime: null,
    elapsedTime: 0
  });
  const [interval, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [saveInterval, setSaveIntervalId] = useState<NodeJS.Timeout | null>(null);

  // หยุดเวลาเมื่อ unmount
  useEffect(() => {
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (saveInterval) {
        clearInterval(saveInterval);
      }
    };
  }, [interval, saveInterval]);

  // เริ่มจับเวลาสำหรับงาน
  const startTimer = useCallback((taskId: string, initialElapsedTime: number = 0) => {
    // ตรวจสอบว่าเป็นงานที่มีอยู่จริง
    const task = getTaskById(taskId);
    if (!task) {
      console.error(`Task with ID ${taskId} not found`);
      return;
    }

    // หยุดเวลาที่กำลังจับอยู่ (ถ้ามี)
    if (tracker.isRunning && interval) {
      clearInterval(interval);
      if (saveInterval) {
        clearInterval(saveInterval);
      }
    }

    // เริ่มจับเวลาใหม่
    const now = Date.now();
    setTracker({
      isRunning: true,
      taskId,
      startTime: now,
      elapsedTime: initialElapsedTime || 0
    });

    // เริ่ม interval สำหรับอัพเดทเวลา
    const newInterval = setInterval(() => {
      setTracker(prev => {
        if (prev.startTime) {
          const currentElapsed = prev.elapsedTime + 1;
          return {
            ...prev,
            elapsedTime: currentElapsed
          };
        }
        return prev;
      });
    }, 1000);

    // สร้าง interval สำหรับบันทึกเวลาทุก 5 วินาที
    const newSaveInterval = setInterval(() => {
      if (tracker.taskId) {
        updateTask(taskId, {
          elapsedTime: tracker.elapsedTime
        });
        console.log(`Auto-saved elapsed time for task ${taskId}: ${tracker.elapsedTime} seconds`);
      }
    }, 5000);  // บันทึกทุก 5 วินาที

    setIntervalId(newInterval);
    setSaveIntervalId(newSaveInterval);

    toast({
      title: "เริ่มจับเวลาแล้ว",
      description: `กำลังจับเวลาสำหรับงาน "${task.title}"`,
    });
  }, [getTaskById, interval, saveInterval, tracker, updateTask, toast]);

  // หยุดจับเวลา
  const pauseTimer = useCallback(() => {
    if (interval) {
      clearInterval(interval);
      setIntervalId(null);
    }

    if (saveInterval) {
      clearInterval(saveInterval);
      setSaveIntervalId(null);
    }

    setTracker(prev => ({
      ...prev,
      isRunning: false
    }));

    // บันทึกเวลาที่ใช้ไปถ้ามีงานที่กำลังจับเวลาอยู่
    if (tracker.taskId) {
      const task = getTaskById(tracker.taskId);
      if (task) {
        updateTask(tracker.taskId, {
          elapsedTime: tracker.elapsedTime
        });

        toast({
          title: "หยุดจับเวลาชั่วคราว",
          description: `บันทึกเวลาสำหรับงาน "${task.title}" แล้ว`,
        });
      }
    }
  }, [interval, saveInterval, tracker, getTaskById, updateTask, toast]);

  // รีเซ็ตเวลา
  const resetTimer = useCallback(() => {
    if (interval) {
      clearInterval(interval);
      setIntervalId(null);
    }

    if (saveInterval) {
      clearInterval(saveInterval);
      setSaveIntervalId(null);
    }

    // บันทึกการรีเซ็ต
    if (tracker.taskId) {
      updateTask(tracker.taskId, {
        elapsedTime: 0
      });
    }

    setTracker({
      isRunning: false,
      taskId: null,
      startTime: null,
      elapsedTime: 0
    });

    toast({
      title: "รีเซ็ตเวลาสำเร็จ",
      description: "เวลาถูกรีเซ็ตเป็นศูนย์แล้ว",
    });
  }, [interval, saveInterval, tracker.taskId, updateTask, toast]);

  // หยุดเวลาและบันทึกเมื่อเสร็จงาน
  const stopAndMarkAsCompleted = useCallback((taskId: string) => {
    if (interval) {
      clearInterval(interval);
      setIntervalId(null);
    }

    if (saveInterval) {
      clearInterval(saveInterval);
      setSaveIntervalId(null);
    }

    const task = getTaskById(taskId);
    if (!task) return;

    // ถ้าเป็นงานที่กำลังจับเวลาอยู่ ให้ใช้เวลาล่าสุด
    let finalElapsedTime = task.elapsedTime || 0;
    if (tracker.taskId === taskId && tracker.isRunning) {
      finalElapsedTime = tracker.elapsedTime;
    }

    // อัพเดทสถานะงาน
    updateTask(taskId, {
      elapsedTime: finalElapsedTime,
      completed: true
    });

    // รีเซ็ต tracker ถ้าเป็นงานที่กำลังจับเวลาอยู่
    if (tracker.taskId === taskId) {
      setTracker({
        isRunning: false,
        taskId: null,
        startTime: null,
        elapsedTime: 0
      });
    }

    toast({
      title: "งานเสร็จสิ้น",
      description: `บันทึกเวลาทำงาน ${Math.floor(finalElapsedTime / 60)} นาที ${finalElapsedTime % 60} วินาที`,
    });
  }, [interval, saveInterval, tracker, getTaskById, updateTask, toast]);

  // แปลงวินาทีเป็นรูปแบบ HH:MM:SS
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // ฟังก์ชันสำหรับรีเฟรชเวลาของงานที่กำลังจับเวลาอยู่
  const getRealtimeElapsed = useCallback((taskId: string) => {
    if (tracker.isRunning && tracker.taskId === taskId) {
      return tracker.elapsedTime;
    }
    
    const task = getTaskById(taskId);
    return task?.elapsedTime || 0;
  }, [tracker.isRunning, tracker.taskId, tracker.elapsedTime, getTaskById]);

  return {
    isRunning: tracker.isRunning,
    currentTaskId: tracker.taskId,
    elapsedTime: tracker.elapsedTime,
    formatTime,
    startTimer,
    pauseTimer,
    resetTimer,
    stopAndMarkAsCompleted,
    getRealtimeElapsed
  };
} 