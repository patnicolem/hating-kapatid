"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        text-hk-text-secondary
        transition-colors
        hover:bg-hk-surface-secondary
        hover:text-hk-primary
      "
      aria-label="Toggle dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}