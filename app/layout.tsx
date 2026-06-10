import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import { AppProvider } from "@/lib/context";

export const metadata: Metadata = {
  title: "考研英语词库 - 高效单词记忆",
  description: "基于SM-2间隔重复算法的考研英语单词记忆应用，包含核心词汇、真题例句、词根词缀学习",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "考研英语",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)", color: "#1e293b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased">
        <AppProvider>
          <div className="max-w-lg mx-auto min-h-screen relative">
            {children}
            <BottomNav />
            <ServiceWorkerRegistrar />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
