import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RightHome AI - Find Your Perfect Home",
  description: "Smart real estate assistant using AI to help you find your ideal home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
