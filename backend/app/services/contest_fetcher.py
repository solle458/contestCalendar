from datetime import datetime, timezone, timedelta
import httpx
from typing import List, Dict, Any
import re
from app.schemas.contest import ContestCreate
from app.core.logger import logger

class ContestFetcher:
    def __init__(self):
        # AtCoder Problems API
        self.atcoder_problems_api_url = "https://kenkoooo.com/atcoder/resources/contests.json"
        self.codeforces_api_url = "https://codeforces.com/api/contest.list"
    
    async def fetch_atcoder_contests(self) -> List[ContestCreate]:
        """AtCoderのコンテスト情報（モックデータ）を取得"""
        # AtCoder Problems APIが一時停止中のため、モックデータのみを返す
        logger.info("Using mock data for AtCoder contests (AtCoder Problems API is temporarily unavailable)")
        now = datetime.now(timezone.utc)
        
        # 今後のコンテスト情報（モックデータ）
        return [
            ContestCreate(
                id="abc407",
                platform="atcoder",
                title="AtCoder Beginner Contest 407",
                start_time=now + timedelta(days=7),
                duration_min=100,
                url="https://atcoder.jp/contests/abc407"
            ),
            ContestCreate(
                id="arc198",
                platform="atcoder_regular",
                title="AtCoder Regular Contest 198 (Div. 2)",
                start_time=now + timedelta(days=8),
                duration_min=120,
                url="https://atcoder.jp/contests/arc198"
            ),
            ContestCreate(
                id="ahc047",
                platform="atcoder_heuristic",
                title="Toyota Programming Contest 2025#2（AtCoder Heuristic Contest 047）",
                start_time=now + timedelta(days=1),
                duration_min=240,
                url="https://atcoder.jp/contests/ahc047"
            ),
            ContestCreate(
                id="abc410",
                platform="atcoder",
                title="AtCoder Beginner Contest 410",
                start_time=now + timedelta(days=28),
                duration_min=100,
                url="https://atcoder.jp/contests/abc410"
            ),
            ContestCreate(
                id="agc073",
                platform="atcoder_grand",
                title="AtCoder Grand Contest 073",
                start_time=now + timedelta(days=35),
                duration_min=180,
                url="https://atcoder.jp/contests/agc073"
            )
        ]

    async def fetch_codeforces_contests(self) -> List[ContestCreate]:
        """Codeforcesのコンテスト情報を取得"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.codeforces_api_url)
                response.raise_for_status()
                data = response.json()

                if data["status"] != "OK":
                    raise Exception(f"Codeforces API error: {data['comment']}")

                contests = []
                for contest in data["result"]:
                    # 開始時間が未来のコンテストのみを取得
                    start_time = datetime.fromtimestamp(contest["startTimeSeconds"], tz=timezone.utc)
                    if start_time <= datetime.now(timezone.utc):
                        continue

                    # コンテストIDからプラットフォームを判定
                    platform = "codeforces"
                    if contest["type"] == "EDUCATIONAL":
                        platform = "codeforces_educational"

                    contests.append(ContestCreate(
                        id=str(contest["id"]),
                        platform=platform,
                        title=contest["name"],
                        start_time=start_time,
                        duration_min=contest["durationSeconds"] // 60,
                        url=f"https://codeforces.com/contests/{contest['id']}"
                    ))
                return contests
        except Exception as e:
            logger.error(f"Failed to fetch Codeforces contests: {str(e)}")
            
            # エラー時はモックデータを返す
            now = datetime.now(timezone.utc)
            return [
                ContestCreate(
                    id="1888",
                    platform="codeforces",
                    title="Codeforces Round 999 (Div. 2)",
                    start_time=now + timedelta(days=3),
                    duration_min=120,
                    url="https://codeforces.com/contests/1888"
                ),
                ContestCreate(
                    id="1889",
                    platform="codeforces_educational",
                    title="Educational Codeforces Round 170",
                    start_time=now + timedelta(days=10),
                    duration_min=120,
                    url="https://codeforces.com/contests/1889"
                )
            ]

    async def fetch_all_contests(self) -> List[ContestCreate]:
        """すべてのプラットフォームからコンテスト情報を取得"""
        atcoder_contests = []
        codeforces_contests = []
        
        try:
            atcoder_contests = await self.fetch_atcoder_contests()
            logger.info(f"Successfully fetched {len(atcoder_contests)} AtCoder contests")
        except Exception as e:
            logger.error(f"Failed to fetch AtCoder contests: {str(e)}")
        
        try:
            codeforces_contests = await self.fetch_codeforces_contests()
            logger.info(f"Successfully fetched {len(codeforces_contests)} Codeforces contests")
        except Exception as e:
            logger.error(f"Failed to fetch Codeforces contests: {str(e)}")
        
        return atcoder_contests + codeforces_contests 
