"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createApiClient, type Contest } from "@/lib/api-client";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const api = createApiClient();

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const platform = selectedPlatform === "all" ? undefined : selectedPlatform;
        const contestsApi = await api.contests();
        const data = await contestsApi.list(platform);
        setContests(data);
      } catch (error) {
        console.error("Failed to fetch contests:", error);
        toast.error("コンテスト情報の取得に失敗しました");
      }
    };
    fetchContests();
  }, [selectedPlatform, session?.accessToken]);

  const handleSync = async () => {
    try {
      setIsSyncing(true);

      // セッション情報のデバッグ出力
      console.log("カレンダー同期開始 - セッション情報:", {
        sessionExists: !!session,
        accessTokenExists: !!session?.accessToken,
        refreshTokenExists: !!session?.refreshToken,
        idTokenExists: !!session?.idToken,
        user: session?.user
      });

      const syncApi = await api.sync();
      const result = await syncApi.calendar();
      
      if (result.success) {
        toast.success(result.message);
        setLastSyncTime(new Date());
      } else {
        toast.error(result.message);
      }
      
      // コンテスト一覧を再取得
      const platform = selectedPlatform === "all" ? undefined : selectedPlatform;
      const contestsApi = await api.contests();
      const data = await contestsApi.list(platform);
      setContests(data);
    } catch (error) {
      console.error("Failed to sync calendar:", error);
      toast.error("カレンダー同期に失敗しました");
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "yyyy年MM月dd日 HH:mm", { locale: ja });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">コンテストカレンダー</h1>
        <div className="flex gap-4 items-center">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="プラットフォームを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="atcoder">AtCoder</SelectItem>
              <SelectItem value="codeforces">Codeforces</SelectItem>
              <SelectItem value="omc">OMC</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? "同期中..." : "カレンダーを同期"}
          </Button>
        </div>
      </div>

      {lastSyncTime && (
        <p className="text-sm text-gray-500 mb-4">
          最終同期: {format(lastSyncTime, "yyyy年MM月dd日 HH:mm:ss", { locale: ja })}
        </p>
      )}

      <div className="grid gap-4">
        {contests.map((contest) => (
          <Card key={contest.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{contest.title}</span>
                <span className="text-sm font-normal px-2 py-1 bg-gray-100 rounded">
                  {contest.platform.toUpperCase()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">開始時間</p>
                  <p>{formatDate(contest.start_time)}</p>
                </div>
                <div>
                  <p className="text-gray-500">開催時間</p>
                  <p>{formatDuration(contest.duration_min)}</p>
                </div>
              </div>
              <div className="mt-4">
                <a
                  href={contest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  コンテストページを開く →
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
