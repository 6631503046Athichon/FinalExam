import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, LayoutDashboard, ListChecks, BarChart2, FolderPlus } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };
  
  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsOpen(false)}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ease-in-out bg-background border-r h-full",
        isOpen ? "translate-x-0 shadow-lg" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-16 items-center px-4 border-b">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <ListChecks className="h-6 w-6" />
            <span>Todo Manager</span>
          </Link>
        </div>
        
        <nav className="space-y-1 p-2">
          <Link to="/">
            <Button 
              variant={isActive("/") ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isActive("/") ? "" : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              แดชบอร์ด
            </Button>
          </Link>
          
          <Link to="/tasks">
            <Button 
              variant={isActive("/tasks") ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isActive("/tasks") ? "" : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <ListChecks className="h-5 w-5" />
              รายการงาน
            </Button>
          </Link>
          
          <Link to="/categories">
            <Button 
              variant={isActive("/categories") ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isActive("/categories") ? "" : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <FolderPlus className="h-5 w-5" />
              หมวดหมู่
            </Button>
          </Link>
          
          <Link to="/stats">
            <Button 
              variant={isActive("/stats") ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isActive("/stats") ? "" : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <BarChart2 className="h-5 w-5" />
              สถิติ
            </Button>
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
