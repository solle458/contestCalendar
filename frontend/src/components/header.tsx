"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            コンテストカレンダー
          </Link>
          {session && (
            <>
              <Link
                href="/dashboard"
                className={`text-sm ${
                  isActive("/dashboard") ? "text-blue-600" : "text-gray-600"
                }`}
              >
                ダッシュボード
              </Link>
              <Link
                href="/settings"
                className={`text-sm ${
                  isActive("/settings") ? "text-blue-600" : "text-gray-600"
                }`}
              >
                設定
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user?.email}</span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                ログアウト
              </Button>
            </div>
          ) : (
            <Link href="/auth/signin">
              <Button size="sm">ログイン</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 
