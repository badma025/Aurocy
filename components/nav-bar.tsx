"use client";

import Image from "next/image";
import Link from "next/link";

export default function NavBar() {
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
          </div>
        </div>
      </div>
    </nav>
  );
}
