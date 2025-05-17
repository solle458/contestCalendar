import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <section className="flex flex-col md:flex-row items-center gap-12 mb-16">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            競技プログラミングコンテストを
            <span className="text-blue-600 dark:text-blue-400">見逃さない</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            AtCoder、Codeforcesの競技プログラミングコンテストの予定を
            自動でGoogleカレンダーに同期します。
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/auth/signin">
              <Button size="lg" className="font-medium">
                今すぐ始める
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="font-medium">
                機能を見る
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <Image
              src="/calendar-illustration.svg"
              alt="カレンダーイラスト"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </section>

      <section id="features" className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">主な機能</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>複数サイトに対応</CardTitle>
            </CardHeader>
            <CardContent>
              <p>AtCoder、Codeforcesの競技プログラミングサイトのコンテスト情報を一元管理します。</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>自動同期</CardTitle>
            </CardHeader>
            <CardContent>
              <p>定期的に最新のコンテスト情報を取得し、あなたのGoogleカレンダーに自動で同期します。</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>カスタマイズ可能</CardTitle>
            </CardHeader>
            <CardContent>
              <p>通知設定や同期するコンテストの種類など、あなたの好みに合わせてカスタマイズできます。</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-gray-800 rounded-xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">対応サイト</h2>
        <div className="flex flex-wrap justify-center gap-8 items-center">
          <div className="text-center p-4">
            <div className="font-bold text-xl mb-2">AtCoder（現在対応中）</div>
            <p className="text-gray-600 dark:text-gray-300">日本発の人気競技プログラミングサイト</p>
          </div>
          <div className="text-center p-4">
            <div className="font-bold text-xl mb-2">Codeforces</div>
            <p className="text-gray-600 dark:text-gray-300">世界的に有名な競技プログラミングプラットフォーム</p>
          </div>
          {/* <div className="text-center p-4">
            <div className="font-bold text-xl mb-2">OMC</div>
            <p className="text-gray-600 dark:text-gray-300">Online Marathon Contests</p>
          </div> */}
        </div>
      </section>

      <section className="py-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">今すぐ始めましょう</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Google認証でカンタンに登録・ログインできます。
            あなたのコンテストスケジュール管理をもっと簡単に。
          </p>
          <Link href="/auth/signin">
            <Button size="lg" className="font-medium">
              無料で始める
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
