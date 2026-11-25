"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { BookOpen, Briefcase, FolderGit2, Home, Mail, Moon, Sparkles, Sun, User } from "lucide-react";

import { toggleThemeWithRipple } from "@/lib/theme-transition";
import { cn } from "@/lib/utils";

interface FloatingDockProps {
  activeSection: string;
  visible: boolean;
  onNavigate: (selector: string) => void;
}

const dockItems = [
  { id: "hero", label: "Home", icon: Home },
  { id: "about", label: "About", icon: User },
  { id: "journey", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Work", icon: FolderGit2 },
  { id: "craft", label: "Craft", icon: Sparkles },
  { id: "writing", label: "Blog", icon: BookOpen },
];

/**
 * Bottom-center floating dock inspired by portfolio-nextjs-template.
 */
export function FloatingDock({
  activeSection,
  visible,
  onNavigate,
}: Readonly<FloatingDockProps>) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav
      aria-label="Prototype section dock"
      className={cn(
        "fixed bottom-5 left-1/2 z-40 flex h-[54px] w-max -translate-x-1/2 items-center gap-1 rounded-full border border-border/80 bg-background/75 p-1.5 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      {dockItems.map(({ id, label, icon: Icon }) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            onClick={() => onNavigate(`#${id}`)}
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {isActive && (
              <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary" />
            )}
          </button>
        );
      })}

      <span className="mx-1 h-5 w-px bg-border/80" />

      <button
        type="button"
        onClick={(e) => toggleThemeWithRipple(e, resolvedTheme, setTheme)}
        aria-label="Toggle theme"
        title="Toggle theme"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {mounted && resolvedTheme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>

      <button
        type="button"
        onClick={() => onNavigate("#contact")}
        aria-label="Talk to me"
        title="Talk to me"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Mail className="h-4 w-4" />
      </button>
    </nav>
  );
}
