import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Astrix",
  description: "The premium academic platform for IIITDM Jabalpur students.",
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-inter">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
