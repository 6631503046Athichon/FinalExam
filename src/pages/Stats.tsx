
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useTaskStats } from "@/hooks/useTaskStats";

const Stats = () => {
  const { tasks } = useTasks();
  const { categories } = useCategories();
  const { completed, pending, total } = useTaskStats();
  
  // Status chart data
  const statusData = [
    { name: "เสร็จสิ้น", value: completed },
    { name: "รอดำเนินการ", value: pending },
  ];
  
  // Priority chart data
  const priorityData = [
    { name: "ความสำคัญสูง", value: tasks.filter(t => t.priority === "high").length },
    { name: "ความสำคัญปานกลาง", value: tasks.filter(t => t.priority === "medium").length },
    { name: "ความสำคัญต่ำ", value: tasks.filter(t => t.priority === "low").length },
  ];
  
  // Category chart data
  const categoryData = categories.map(category => ({
    name: category.name,
    value: tasks.filter(t => t.categoryId === category.id).length,
  }));
  
  // Add "ไม่มีหมวดหมู่" category
  const tasksWithoutCategory = tasks.filter(t => !t.categoryId).length;
  if (tasksWithoutCategory > 0) {
    categoryData.push({ name: "ไม่มีหมวดหมู่", value: tasksWithoutCategory });
  }
  
  // Chart colors
  const STATUS_COLORS = ["#10b981", "#f97316"];
  const PRIORITY_COLORS = ["#ef4444", "#f97316", "#3b82f6"];
  const CATEGORY_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f97316", "#ef4444", "#ec4899"];

  const getPercentage = (value: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">สถิติและความสำเร็จ</h1>
        <p className="text-muted-foreground">ดูภาพรวมงานและความคืบหน้าของคุณ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>งานทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>เสร็จสิ้น</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-500">{completed}</p>
            <p className="text-muted-foreground">
              {getPercentage(completed)}% ของงานทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>รอดำเนินการ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-orange-500">{pending}</p>
            <p className="text-muted-foreground">
              {getPercentage(pending)}% ของงานทั้งหมด
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="h-[400px]">
          <CardHeader>
            <CardTitle>สถานะงาน</CardTitle>
            <CardDescription>สัดส่วนของงานตามสถานะ</CardDescription>
          </CardHeader>
          <CardContent>
            {total > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">ไม่มีข้อมูลงานให้แสดง</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-[400px]">
          <CardHeader>
            <CardTitle>ความสำคัญ</CardTitle>
            <CardDescription>สัดส่วนของงานตามระดับความสำคัญ</CardDescription>
          </CardHeader>
          <CardContent>
            {total > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">ไม่มีข้อมูลงานให้แสดง</p>
              </div>
            )}
          </CardContent>
        </Card>

        {categories.length > 0 && (
          <Card className="h-[400px] lg:col-span-2">
            <CardHeader>
              <CardTitle>หมวดหมู่</CardTitle>
              <CardDescription>การกระจายของงานตามหมวดหมู่</CardDescription>
            </CardHeader>
            <CardContent>
              {total > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">ไม่มีข้อมูลงานให้แสดง</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Stats;
