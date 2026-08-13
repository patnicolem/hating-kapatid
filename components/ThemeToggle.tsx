"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof document === "undefined") return false;

    const stored = window.localStorage.getItem("hk-theme");

    if (stored) {
      return stored === "dark";
    }

    return document.documentElement.classList.contains("dark");
  });

  function toggleTheme() {
    const html = document.documentElement;

    const isDark = !html.classList.contains("dark");

    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    window.localStorage.setItem("hk-theme", isDark ? "dark" : "light");

    setDarkMode(isDark);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
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
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}