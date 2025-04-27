import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    // Auto collapse sidebar on mobile
    if (!isDesktop) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isDesktop]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="todo-theme">
      <div className="relative min-h-screen bg-background">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Main content wrapper */}
        <div className={cn(
          "min-h-screen transition-all duration-300",
          isDesktop ? "lg:pl-64" : ""
        )}>
          {/* Navbar */}
          <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
          
          {/* Content */}
          <main className="container px-4 py-4">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Layout;
