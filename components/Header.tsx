"use client";

import Link from "next/link";

import {
  House,
  Users,
  Settings,
  CircleUserRound,
  HandCoins,
} from "lucide-react";

export default function Header() {

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: House,
    },
    {
      name: "Groups",
      href: "/groups",
      icon: Users,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <header>
      <nav className="w-full bg-hk-primary px-8 py-4">

        <div className="flex items-center w-full">

          {/* App Title + Catchphrase */}
          <div className="flex items-center gap-2">

            <HandCoins
              size={24}
              className="text-white"
            />

            <Link
              href="/"
              className="flex items-baseline gap-3"
            >
              <span className="text-xl font-bold text-white">
                Hating Kapatid
              </span>

              <span className="text-sm text-hk-accent">
                ambagan made easy
              </span>
            </Link>

          </div>


          {/* Navigation + Guest */}
          <div className="ml-auto flex items-center gap-6">

            {navItems.map((item) => {

              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="
                    flex
                    items-center
                    gap-2
                    font-medium
                    text-white
                    hover:text-hk-accent
                    transition-colors
                  "
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );

            })}


            {/* Guest */}
            <div
              className="
                flex
                items-center
                gap-2
                text-white
                font-medium
                border-l
                border-white/30
                pl-6
              "
            >
              <CircleUserRound size={18} />
              Guest
            </div>

          </div>

        </div>

      </nav>
    </header>
  );
}