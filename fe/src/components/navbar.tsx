"use client";

import { useState } from "react";
import Link from "next/link";
import { Clapperboard, CircleUserRound, Search, Menu, X } from "lucide-react";
import { CitySelector } from "@/components/city-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-violet-200/50 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md dark:from-violet-950 dark:to-indigo-950 dark:border-violet-800">
      <nav className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight"
        >
          <Clapperboard className="size-6" />
          BookMyFlix
        </Link>

        {/* Search bar — center (hidden on mobile) */}
        <div className="relative mx-auto hidden w-full max-w-md sm:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-violet-300" />
          <input
            type="text"
            placeholder="Search movies, theaters..."
            className="w-full rounded-full border border-white/20 bg-white/10 py-1.5 pl-9 pr-4 text-sm text-white placeholder:text-violet-200 outline-none focus:border-white/40 focus:bg-white/15"
          />
        </div>

        {/* Right side — desktop */}
        <div className="hidden shrink-0 items-center gap-4 sm:flex">
          <CitySelector />
          <ThemeToggle />
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            Login
            <CircleUserRound className="size-5" />
          </Link>
        </div>

        {/* Mobile — theme toggle + hamburger */}
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 transition-colors hover:bg-white/20"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 bg-gradient-to-b from-violet-600 to-indigo-700 text-white border-violet-500"
            >
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-white">
                  <Clapperboard className="size-5" />
                  BookMyFlix
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-6 px-4 pt-4">
                {/* Mobile search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-violet-300" />
                  <input
                    type="text"
                    placeholder="Search movies, theaters..."
                    className="w-full rounded-full border border-white/20 bg-white/10 py-2 pl-9 pr-4 text-sm text-white placeholder:text-violet-200 outline-none focus:border-white/40 focus:bg-white/15"
                  />
                </div>

                {/* Mobile nav links */}
                <div className="flex flex-col gap-1">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
                  >
                    Home
                  </Link>
                  <Link
                    href="/movies"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
                  >
                    Movies
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
                  >
                    <CircleUserRound className="size-4" />
                    Login
                  </Link>
                </div>

                {/* City selector in mobile */}
                <div className="border-t border-white/20 pt-4">
                  <CitySelector />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
