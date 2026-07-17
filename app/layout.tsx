import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Doodle Chat",
  description: "A simple, accessible chat interface.",
} satisfies Metadata;

const fontVariables = [geistSans.variable, geistMono.variable] as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables.join(" ")}>
      <body>{children}</body>
    </html>
  );
}
