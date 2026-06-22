import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/nav-bar";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Aurocy - Anki Flashcard Decks",
  description: "Premium Anki flashcard decks for medical students",
  icons: {
    icon: "/aurocy.ico",
    shortcut: "/aurocy.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
