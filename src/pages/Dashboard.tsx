import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ListChecks, BarChart } from "lucide-react";
import { Link } from "react-router-dom";
import { useTaskStats } from "@/hooks/useTaskStats";
import TaskProgress from "@/components/TaskProgress";

const Dashboard = () => {
  const { completed, pending, total } = useTaskStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">สวัสดี!</h1>
        <p className="text-muted-foreground text-xl">ยินดีต้อนรับกลับมา นี่คือภาพรวมงานของคุณ</p>
      </div>

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
