import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/footer";
import { NetworkStatus } from "@/components/network-status";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/lib/providers";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ScrollToTopButton from "@/components/scroll-to-top-button";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "유럽 5대 리그 - 축구 데이터",
  description: "유럽 5대 리그의 축구 데이터를 제공하는 웹앱입니다.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">{children}</main>
              <ScrollToTopButton />
              <Footer />
              <NetworkStatus />
              <Toaster />
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
