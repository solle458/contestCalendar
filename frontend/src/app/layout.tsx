import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "sonner";
import { SkipLink } from "@/components/skip-link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "コンテストカレンダー",
  description: "競技プログラミングコンテストのカレンダー管理アプリケーション",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>
          <SkipLink />
          <Header />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
