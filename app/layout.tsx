import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/nav-bar";

export const metadata: Metadata = {
  title: "Aurocy - Anki Flashcard Decks",
  description: "Premium Anki flashcard decks for medical students",
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
