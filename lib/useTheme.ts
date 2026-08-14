"use client";

import { useCallback, useSyncExternalStore } from "react";

const THEME_KEY = "hk-theme";
const THEME_EVENT = "hk-theme-change";

function readTheme(): boolean {
  if (typeof document === "undefined") return false;

  const stored = window.localStorage.getItem(THEME_KEY);

  if (stored) {
    return stored === "dark";
  }

  return document.documentElement.classList.contains("dark");
}

function subscribeTheme(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_EVENT, onStoreChange);
  };
}

export function useTheme() {
  const isDark = useSyncExternalStore(subscribeTheme, readTheme, () => false);

  const toggle = useCallback(() => {
    const html = document.documentElement;
    const next = !html.classList.contains("dark");

    html.classList.toggle("dark", next);
    window.localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return { isDark, toggle };
}