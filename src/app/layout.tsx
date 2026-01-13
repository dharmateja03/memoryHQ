import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "MindForge - Brain Training",
  description: "Personalized cognitive training to sharpen your mind. Train memory, attention, processing speed, problem-solving, and cognitive flexibility.",
  keywords: ["brain training", "cognitive training", "memory", "attention", "mental fitness"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-navy-900 text-gray-100 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
