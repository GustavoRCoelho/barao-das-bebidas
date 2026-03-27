"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

type Props = {
  className?: string;
  compacto?: boolean;
};

export function ThemeToggle({ className, compacto = false }: Props) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size={compacto ? "icon-sm" : "sm"} className={className} disabled>
        {compacto ? "T" : "Tema"}
      </Button>
    );
  }

  const isDark = theme !== "light";

  return (
    <Button
      type="button"
      variant="outline"
      size={compacto ? "icon-sm" : "sm"}
      className={className}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Alternar para tema claro" : "Alternar para tema escuro"}
      title={isDark ? "Tema claro" : "Tema escuro"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {compacto ? null : isDark ? "Tema claro" : "Tema escuro"}
    </Button>
  );
}

