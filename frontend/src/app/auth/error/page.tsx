import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AuthError() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>認証エラー</CardTitle>
          <CardDescription>
            認証中にエラーが発生しました。もう一度お試しください。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild>
            <Link href="/auth/signin">ログインページに戻る</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">トップページに戻る</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 
