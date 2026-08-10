"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  UsersRound,
  Settings,
  UserCircle,
  Sun,
  Moon,
  HandCoins,
} from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  function toggleTheme() {
    const html = document.documentElement;

    html.classList.toggle("dark");

    setIsDarkMode(html.classList.contains("dark"));
  }

  return (
    <header className="border-b border-hk-border bg-hk-surface text-hk-text shadow-sm">

      <div className="
        mx-auto
        flex
        min-h-16
        w-full
        max-w-7xl
        items-center
        justify-between
        px-4
        sm:px-6
        lg:px-8
      ">

      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2"
        onClick={() => setIsMenuOpen(false)}
      >
        <span
          className="
            text-xl
            font-bold
            tracking-tight
            text-hk-primary
            sm:text-2xl
          "
        >
          Hating Kapatid
        </span>

        {/* Hand Coins Icon */}
        <HandCoins
          size={24}
          strokeWidth={2}
          className="text-hk-primary sm:size-6"
        />

        <span
          className="
            hidden
            text-sm
            text-hk-text-secondary
            sm:inline
          "
        >
          ambagan made easy
        </span>
      </Link>


        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">

          <Link
            href="/"
            className="
              flex
              items-center
              gap-2
              rounded-lg
              px-3
              py-2
              text-sm
              font-medium
              text-hk-text-secondary
              transition-colors
              hover:bg-hk-surface-secondary
              hover:text-hk-primary
            "
          >
            <Home size={18} />
            Home
          </Link>


          <Link
            href="/groups"
            className="
              flex
              items-center
              gap-2
              rounded-lg
              px-3
              py-2
              text-sm
              font-medium
              text-hk-text-secondary
              transition-colors
              hover:bg-hk-surface-secondary
              hover:text-hk-primary
            "
          >
            <UsersRound size={18} />
            Groups
          </Link>


          <Link
            href="/settings"
            className="
              flex
              items-center
              gap-2
              rounded-lg
              px-3
              py-2
              text-sm
              font-medium
              text-hk-text-secondary
              transition-colors
              hover:bg-hk-surface-secondary
              hover:text-hk-primary
            "
          >
            <Settings size={18} />
            Settings
          </Link>


          {/* Divider */}
          <div className="mx-2 h-6 w-px bg-hk-border" />


          {/* User */}
          <div className="
            flex
            items-center
            gap-2
            rounded-lg
            px-3
            py-2
            text-sm
            font-medium
            text-hk-text-secondary
          ">
            <UserCircle size={18} />
            Guest
          </div>


          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="
              ml-2
              flex
              items-center
              justify-center
              rounded-lg
              p-2
              text-hk-text-secondary
              transition-colors
              hover:bg-hk-surface-secondary
              hover:text-hk-primary
            "
            aria-label="Toggle dark mode"
            title={
              isDarkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {isDarkMode ? (
              <Sun size={19} />
            ) : (
              <Moon size={19} />
            )}
          </button>

        </nav>


        {/* Mobile Controls */}
        <div className="flex items-center gap-1 md:hidden">

          {/* Mobile Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="
              rounded-lg
              p-2
              text-hk-text-secondary
              transition-colors
              hover:bg-hk-surface-secondary
              hover:text-hk-primary
            "
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun size={21} />
            ) : (
              <Moon size={21} />
            )}
          </button>


          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="
              rounded-lg
              p-2
              text-hk-text-secondary
              transition-colors
              hover:bg-hk-surface-secondary
              hover:text-hk-primary
            "
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>

        </div>

      </div>


      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="
          border-t
          border-hk-border
          bg-hk-surface
          px-4
          py-3
          md:hidden
        ">

          <div className="
            mx-auto
            flex
            max-w-7xl
            flex-col
            gap-1
          ">

            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="
                flex
                items-center
                gap-3
                rounded-lg
                px-3
                py-3
                text-hk-text-secondary
                transition-colors
                hover:bg-hk-surface-secondary
                hover:text-hk-primary
              "
            >
              <Home size={20} />
              Home
            </Link>


            <Link
              href="/groups"
              onClick={() => setIsMenuOpen(false)}
              className="
                flex
                items-center
                gap-3
                rounded-lg
                px-3
                py-3
                text-hk-text-secondary
                transition-colors
                hover:bg-hk-surface-secondary
                hover:text-hk-primary
              "
            >
              <UsersRound size={20} />
              Groups
            </Link>


            <Link
              href="/settings"
              onClick={() => setIsMenuOpen(false)}
              className="
                flex
                items-center
                gap-3
                rounded-lg
                px-3
                py-3
                text-hk-text-secondary
                transition-colors
                hover:bg-hk-surface-secondary
                hover:text-hk-primary
              "
            >
              <Settings size={20} />
              Settings
            </Link>


            <div className="my-1 border-t border-hk-border" />


            {/* Mobile User */}
            <div className="
              flex
              items-center
              gap-3
              px-3
              py-3
              text-hk-text-secondary
            ">
              <UserCircle size={20} />
              Guest
            </div>

          </div>

        </nav>
      )}

    </header>
  );
}