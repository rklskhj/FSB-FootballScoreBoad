import { NextRequest, NextResponse } from "next/server";
import { fetchAndStoreLeagueStandings } from "@/lib/footballDataService";

// 유럽 5대 리그 ID (football-data.org 기준)
const LEAGUES = [
  { id: 2021, season: 2023 }, // 프리미어 리그
  { id: 2014, season: 2023 }, // 라 리가
  { id: 2019, season: 2023 }, // 세리에 A
  { id: 2002, season: 2023 }, // 분데스리가
  { id: 2015, season: 2023 }, // 리그 1
];

export async function GET(request: NextRequest) {
  // 보안을 위한 시크릿 키 확인
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const UPDATE_SECRET = process.env.UPDATE_SECRET_KEY;

  if (secret !== UPDATE_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized - 올바른 시크릿 키를 제공하세요" },
      { status: 401 }
    );
  }

  // 현재 요일과 시간을 체크하여 경기가 많은 시간대에는 더 자주 업데이트
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = 일요일, 6 = 토요일
  const hour = now.getHours();

  // 주말(토,일) 오후 시간대는 경기가 많으므로 모든 리그 업데이트
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isPrimeTime = hour >= 15 && hour <= 23; // 오후 3시 ~ 밤 11시

  // 업데이트할 리그 선택
  let leaguesToUpdate = LEAGUES;

  // 평일 비프라임 시간대는 일부 리그만 업데이트 (선택적)
  if (!isWeekend && !isPrimeTime) {
    // 평일 비프라임 시간대는 2개 리그만 업데이트
    const currentHour = now.getHours();
    const index = Math.floor(currentHour / 2) % LEAGUES.length;
    leaguesToUpdate = [LEAGUES[index], LEAGUES[(index + 1) % LEAGUES.length]];
  }

  try {
    console.log(`⏰ 데이터 업데이트 시작: ${now.toISOString()}`);
    console.log(
      `📊 업데이트할 리그: ${leaguesToUpdate.map((l) => l.id).join(", ")}`
    );

    // 변경된 데이터가 있는지 확인하기 위한 로직
    const results = await Promise.all(
      leaguesToUpdate.map(async (league) => {
        try {
          console.log(`🔄 리그 ${league.id} 업데이트 시작`);
          const data = await fetchAndStoreLeagueStandings(
            league.id,
            league.season
          );
          console.log(`✅ 리그 ${league.id} 업데이트 완료`);
          return {
            league: league.id,
            season: league.season,
            success: true,
            updated: true,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error(`❌ 리그 ${league.id} 업데이트 실패:`, error);
          return {
            league: league.id,
            season: league.season,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
          };
        }
      })
    );

    return NextResponse.json({
      results,
      timestamp: new Date().toISOString(),
      summary: {
        isWeekend,
        isPrimeTime,
        leagueCount: leaguesToUpdate.length,
        success: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    });
  } catch (error) {
    console.error("❌ 데이터 업데이트 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "데이터 업데이트 실패",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
