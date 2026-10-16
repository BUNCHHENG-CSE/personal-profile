"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const currentTheme = resolvedTheme || theme;
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  const isDark = mounted
    ? resolvedTheme === "dark" || (!resolvedTheme && theme === "dark")
    : true; // Default theme is dark in RootLayout

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={toggleTheme}
      className={cn("theme-toggle-btn", className)}
      aria-label="Toggle theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <Sun
        className={cn(
          "h-[1.15rem] w-[1.15rem] transition-all duration-300",
          mounted
            ? isDark
              ? "rotate-90 scale-0 absolute"
              : "rotate-0 scale-100"
            : "rotate-0 scale-100 dark:-rotate-90 dark:scale-0 dark:absolute"
        )}
      />
      <Moon
        className={cn(
          "h-[1.15rem] w-[1.15rem] transition-all duration-300",
          mounted
            ? isDark
              ? "rotate-0 scale-100"
              : "-rotate-90 scale-0 absolute"
            : "rotate-90 scale-0 absolute dark:rotate-0 dark:scale-100 dark:relative"
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

