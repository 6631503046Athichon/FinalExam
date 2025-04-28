import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Menu, Moon, Sun, SunMoon } from "lucide-react";
import { useState, useCallback } from "react";

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Navbar = ({ toggleSidebar, isSidebarOpen }: NavbarProps) => {
  const { theme, setTheme } = useTheme();
  const [isChangingTheme, setIsChangingTheme] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<"light" | "dark" | "system" | null>(null);
  
  // ฟังก์ชันจัดการการเปลี่ยน theme พร้อมป้องกันการกดซ้ำ
  const handleThemeChange = useCallback(() => {
    if (isChangingTheme) return; // ป้องกันการกดซ้ำระหว่างกำลังเปลี่ยน theme
    setIsChangingTheme(true);
    // คำนวณ theme ถัดไป
    const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setPendingTheme(nextTheme);
    setTheme(nextTheme);
    setTimeout(() => {
      setIsChangingTheme(false);
      setPendingTheme(null);
    }, 300);
  }, [theme, setTheme, isChangingTheme]);
  
  // ใช้ pendingTheme ถ้ามี ไม่งั้นใช้ theme ปกติ
  const displayTheme = pendingTheme ?? theme;

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="mr-2 lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        <div className="flex-1">
          <span className="font-bold text-lg md:text-xl">Todo App</span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleThemeChange}
            disabled={isChangingTheme}
            className="bg-background text-foreground"
          >
            {displayTheme === "light" ? (
              <Sun className="h-5 w-5" />
            ) : displayTheme === "dark" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <SunMoon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
