import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Contest Calendar
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          競技プログラミングコンテストのスケジュールをGoogleカレンダーと同期して、効率的に管理しましょう。
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>AtCoder</CardTitle>
            <CardDescription>AtCoderのコンテスト情報を自動取得</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ABC、ARC、AGCなどのコンテスト情報を自動でカレンダーに登録します。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Codeforces</CardTitle>
            <CardDescription>Codeforcesのコンテスト情報を自動取得</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Div.1、Div.2、Educationalなどのコンテスト情報を自動でカレンダーに登録します。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>OMC</CardTitle>
            <CardDescription>OMCのコンテスト情報を自動取得</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Online Marathon Contestsのコンテスト情報を自動でカレンダーに登録します。
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/dashboard">ダッシュボードへ</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/settings">設定</Link>
        </Button>
      </div>
    </div>
  );
} 
