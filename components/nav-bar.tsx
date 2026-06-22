"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function NavBar() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-700/30 bg-[#0B1120]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-bold tracking-tight text-white"
          >
            <Image
              src="/logo.svg"
              alt="Aurocy logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-md"
              priority
            />
            <span>Aurocy</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/shop"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/blog"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Blog
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-700/30 text-gray-300 hover:text-white transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
