import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

// API 키와 기본 URL 설정
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4";

// 리그 ID 매핑
const leagueMapping: Record<string, number> = {
  "premier-league": 2021,
  "la-liga": 2014,
  "serie-a": 2019,
  bundesliga: 2002,
  "ligue-1": 2015,
  "champions-league": 2001,
};

// 경기 일정 데이터 타입 정의
interface FixtureData {
  id: number;
  date: string;
  status: string;
  matchday: number;
  stage: string;
  homeTeam: string;
  homeTeamLogo: string;
  awayTeam: string;
  awayTeamLogo: string;
  score: {
    home: number | null;
    away: number | null;
  };
  venue: string;
}

/**
 * football-data.org API에서 데이터 가져오기
 */
async function fetchFromFootballData(endpoint: string) {
  if (!FOOTBALL_DATA_API_KEY) {
    throw new Error("FOOTBALL_DATA_API_KEY is not set");
  }

  const url = `${FOOTBALL_DATA_BASE_URL}/${endpoint}`;
  console.log(`Requesting API data: ${url}`);

  const headers: Record<string, string> = {
    "X-Auth-Token": FOOTBALL_DATA_API_KEY,
  };

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
      next: { revalidate: 3600 }, // 1시간마다 데이터 리밸리데이션
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching from football-data.org:", error);
    throw error;
  }
}

/**
 * Firebase에서 경기 일정 데이터 가져오기
 */
async function getFixturesFromFirebase(leagueId: string) {
  try {
    // Firebase Admin이 초기화되지 않았으면 null 반환
    if (!adminDb) {
      console.log(
        "Firebase Admin SDK not initialized, skipping Firestore check"
      );
      return null;
    }

    const docRef = adminDb.collection("fixtures").doc(leagueId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();

      // data가 존재하는지 확인
      if (!data) {
        console.log(`No fixtures data found for league ${leagueId}`);
        return null;
      }

      // 마지막 업데이트가 24시간 이상 지났는지 확인
      const lastUpdated = data.lastUpdated?.toDate();
      if (lastUpdated) {
        const now = new Date();
        const hoursSinceUpdate =
          (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

        // 24시간 이상 지났으면 새로운 데이터 가져오기
        if (hoursSinceUpdate >= 24) {
          console.log(
            `Fixtures data is more than 24 hours old, fetching new data for league ${leagueId}`
          );
          return null;
        }

        console.log(
          `Using cached fixtures data for league ${leagueId} (last updated: ${lastUpdated.toISOString()})`
        );
        return {
          fixtures: data.fixtures,
          groupedFixtures: data.groupedFixtures,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting fixtures data from Firebase:", error);
    return null;
  }
}

/**
 * Firebase에 경기 일정 데이터 저장
 */
async function storeFixturesToFirebase(
  leagueId: string,
  fixturesData: {
    fixtures: FixtureData[];
    groupedFixtures: Record<string, FixtureData[]>;
  }
) {
  try {
    if (!adminDb) {
      console.log("Firebase Admin SDK not initialized, skipping data storage");
      return false;
    }

    const docRef = adminDb.collection("fixtures").doc(leagueId);
    await docRef.set({
      fixtures: fixturesData.fixtures,
      groupedFixtures: fixturesData.groupedFixtures,
      lastUpdated: Timestamp.now(),
    });

    console.log(`Fixtures data stored in Firebase for league ${leagueId}`);
    return true;
  } catch (error) {
    console.error("Error storing fixtures data in Firebase:", error);
    return false;
  }
}

// 목업 경기 일정 데이터
const mockFixturesData = {
  "premier-league": [
    {
      id: 1,
      date: "2024-05-19T14:00:00Z",
      status: "SCHEDULED",
      matchday: 38,
      stage: "REGULAR_SEASON",
      homeTeam: "맨체스터 시티",
      homeTeamLogo: "/teams/man-city.png",
      awayTeam: "웨스트햄",
      awayTeamLogo: "/teams/west-ham.png",
      score: { home: null, away: null },
      venue: "에티하드 스타디움",
    },
    {
      id: 2,
      date: "2024-05-19T14:00:00Z",
      status: "SCHEDULED",
      matchday: 38,
      stage: "REGULAR_SEASON",
      homeTeam: "아스날",
      homeTeamLogo: "/teams/arsenal.png",
      awayTeam: "에버튼",
      awayTeamLogo: "/teams/everton.png",
      score: { home: null, away: null },
      venue: "에미레이츠 스타디움",
    },
    {
      id: 3,
      date: "2024-05-11T14:00:00Z",
      status: "FINISHED",
      matchday: 37,
      stage: "REGULAR_SEASON",
      homeTeam: "맨체스터 유나이티드",
      homeTeamLogo: "/teams/man-utd.png",
      awayTeam: "뉴캐슬",
      awayTeamLogo: "/teams/newcastle.png",
      score: { home: 1, away: 1 },
      venue: "올드 트래포드",
    },
    {
      id: 4,
      date: "2024-05-11T14:00:00Z",
      status: "FINISHED",
      matchday: 37,
      stage: "REGULAR_SEASON",
      homeTeam: "토트넘",
      homeTeamLogo: "/teams/tottenham.png",
      awayTeam: "번리",
      awayTeamLogo: "/teams/burnley.png",
      score: { home: 2, away: 1 },
      venue: "토트넘 홋스퍼 스타디움",
    },
    {
      id: 5,
      date: "2024-05-04T14:00:00Z",
      status: "FINISHED",
      matchday: 36,
      stage: "REGULAR_SEASON",
      homeTeam: "리버풀",
      homeTeamLogo: "/teams/liverpool.png",
      awayTeam: "토트넘",
      awayTeamLogo: "/teams/tottenham.png",
      score: { home: 4, away: 2 },
      venue: "안필드",
    },
    {
      id: 6,
      date: "2024-04-27T14:00:00Z",
      status: "FINISHED",
      matchday: 35,
      stage: "REGULAR_SEASON",
      homeTeam: "울버햄튼",
      homeTeamLogo: "/teams/wolves.png",
      awayTeam: "루턴",
      awayTeamLogo: "/teams/luton.png",
      score: { home: 2, away: 1 },
      venue: "몰리뉴 스타디움",
    },
    {
      id: 7,
      date: "2024-04-20T14:00:00Z",
      status: "FINISHED",
      matchday: 34,
      stage: "REGULAR_SEASON",
      homeTeam: "첼시",
      homeTeamLogo: "/teams/chelsea.png",
      awayTeam: "웨스트햄",
      awayTeamLogo: "/teams/west-ham.png",
      score: { home: 5, away: 0 },
      venue: "스탬포드 브릿지",
    },
    {
      id: 8,
      date: "2024-03-16T15:00:00Z",
      status: "FINISHED",
      matchday: 29,
      stage: "REGULAR_SEASON",
      homeTeam: "풀럼",
      homeTeamLogo: "/teams/fulham.png",
      awayTeam: "토트넘",
      awayTeamLogo: "/teams/tottenham.png",
      score: { home: 3, away: 0 },
      venue: "크레이븐 코티지",
    },
  ],
  // 다른 리그 데이터...
  "champions-league": [
    {
      id: 1,
      date: "2024-09-17T19:00:00Z",
      status: "SCHEDULED",
      matchday: 1,
      stage: "GROUP_STAGE",
      homeTeam: "유벤투스",
      homeTeamLogo: "/teams/juventus.png",
      awayTeam: "PSV 에인트호번",
      awayTeamLogo: "/teams/psv.png",
      score: { home: null, away: null },
      venue: "알리안츠 스타디움",
    },
    {
      id: 2,
      date: "2024-09-17T19:00:00Z",
      status: "SCHEDULED",
      matchday: 1,
      stage: "GROUP_STAGE",
      homeTeam: "바이에른 뮌헨",
      homeTeamLogo: "/teams/bayern.png",
      awayTeam: "레알 마드리드",
      awayTeamLogo: "/teams/real-madrid.png",
      score: { home: null, away: null },
      venue: "알리안츠 아레나",
    },
    {
      id: 3,
      date: "2024-09-18T19:00:00Z",
      status: "SCHEDULED",
      matchday: 1,
      stage: "GROUP_STAGE",
      homeTeam: "맨체스터 시티",
      homeTeamLogo: "/teams/man-city.png",
      awayTeam: "인터 밀란",
      awayTeamLogo: "/teams/inter.png",
      score: { home: null, away: null },
      venue: "에티하드 스타디움",
    },
    {
      id: 4,
      date: "2024-09-18T19:00:00Z",
      status: "SCHEDULED",
      matchday: 1,
      stage: "GROUP_STAGE",
      homeTeam: "파리 생제르맹",
      homeTeamLogo: "/teams/psg.png",
      awayTeam: "바르셀로나",
      awayTeamLogo: "/teams/barcelona.png",
      score: { home: null, away: null },
      venue: "파르크 데 프랑스",
    },
  ],
};

// 날짜를 월 단위로 그룹화하는 함수
function groupFixturesByMonth(fixtures: FixtureData[]) {
  const grouped: Record<string, FixtureData[]> = {};

  fixtures.forEach((fixture: FixtureData) => {
    const date = new Date(fixture.date);
    const monthYear = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }

    grouped[monthYear].push(fixture);
  });

  return grouped;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get("league");
  const month = searchParams.get("month"); // 선택적 월 필터 (YYYY-MM 형식)

  if (!league || !leagueMapping[league]) {
    return NextResponse.json(
      { error: "유효하지 않은 리그 ID입니다." },
      { status: 400 }
    );
  }

  try {
    // 1. Firebase에서 캐시된 데이터 확인
    const cachedData = await getFixturesFromFirebase(league);
    if (cachedData) {
      // 월별 필터링
      let filteredFixtures = cachedData.fixtures;
      if (month) {
        filteredFixtures = cachedData.fixtures.filter(
          (fixture: FixtureData) => {
            const fixtureDate = new Date(fixture.date);
            const fixtureMonth = `${fixtureDate.getFullYear()}-${String(
              fixtureDate.getMonth() + 1
            ).padStart(2, "0")}`;
            return fixtureMonth === month;
          }
        );
      }

      // 월별 그룹화 (필요한 경우)
      let groupedFixtures = cachedData.groupedFixtures;
      if (month) {
        groupedFixtures = { [month]: filteredFixtures };
      }

      return NextResponse.json({
        fixtures: filteredFixtures,
        groupedFixtures: groupedFixtures,
        isCache: true,
      });
    }

    // 2. 캐시된 데이터가 없으면 API에서 가져오기
    // football-data.org API 키가 설정되어 있는지 확인
    if (!FOOTBALL_DATA_API_KEY) {
      console.log("API 키가 없어 목업 데이터를 반환합니다.");
      const fixtures =
        mockFixturesData[league as keyof typeof mockFixturesData] || [];

      // 월별 필터링
      let filteredFixtures = fixtures;
      if (month) {
        filteredFixtures = fixtures.filter((fixture: FixtureData) => {
          const fixtureDate = new Date(fixture.date);
          const fixtureMonth = `${fixtureDate.getFullYear()}-${String(
            fixtureDate.getMonth() + 1
          ).padStart(2, "0")}`;
          return fixtureMonth === month;
        });
      }

      // 날짜순으로 정렬
      filteredFixtures.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // 월별 그룹화
      const groupedFixtures = groupFixturesByMonth(filteredFixtures);

      return NextResponse.json({
        fixtures: filteredFixtures,
        groupedFixtures: groupedFixtures,
      });
    }

    // API에서 경기 일정 데이터 가져오기
    const leagueId = leagueMapping[league];

    // 전체 시즌 경기 가져오기 (최근 경기 위주로)
    const matchesData = await fetchFromFootballData(
      `competitions/${leagueId}/matches`
    );

    // 데이터 형식 변환
    const formattedFixtures = matchesData.matches.map((match: any) => {
      return {
        id: match.id,
        date: match.utcDate,
        status: match.status,
        matchday: match.matchday,
        stage: match.stage,
        homeTeam: match.homeTeam.name,
        homeTeamLogo: match.homeTeam.crest,
        awayTeam: match.awayTeam.name,
        awayTeamLogo: match.awayTeam.crest,
        score: {
          home: match.score.fullTime.home,
          away: match.score.fullTime.away,
        },
        venue: match.venue,
      };
    });

    // 월별 필터링
    let filteredFixtures = formattedFixtures;
    if (month) {
      filteredFixtures = formattedFixtures.filter((fixture: FixtureData) => {
        const fixtureDate = new Date(fixture.date);
        const fixtureMonth = `${fixtureDate.getFullYear()}-${String(
          fixtureDate.getMonth() + 1
        ).padStart(2, "0")}`;
        return fixtureMonth === month;
      });
    }

    // 날짜순으로 정렬 (최신 경기가 먼저 오도록)
    filteredFixtures.sort(
      (a: FixtureData, b: FixtureData) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // 월별 그룹화
    const groupedFixtures = groupFixturesByMonth(filteredFixtures);

    // 3. 가져온 데이터를 Firebase에 저장 (비동기적으로)
    const fixturesData = {
      fixtures: formattedFixtures,
      groupedFixtures: groupFixturesByMonth(formattedFixtures),
    };

    storeFixturesToFirebase(league, fixturesData)
      .then(() => console.log(`Fixtures data for ${league} stored in Firebase`))
      .catch((err) => console.error(`Error storing fixtures data: ${err}`));

    return NextResponse.json({
      fixtures: filteredFixtures,
      groupedFixtures: groupedFixtures,
    });
  } catch (error) {
    console.error("경기 일정 데이터 가져오기 실패:", error);
    // 에러 발생 시 목업 데이터 반환
    const fixtures =
      mockFixturesData[league as keyof typeof mockFixturesData] || [];
    const groupedFixtures = groupFixturesByMonth(fixtures);

    return NextResponse.json({
      fixtures: fixtures,
      groupedFixtures: groupedFixtures,
    });
  }
}
