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
 * Firebase에서 선수 데이터 가져오기
 */
async function getPlayersFromFirebase(leagueId: string) {
  try {
    // Firebase Admin이 초기화되지 않았으면 null 반환
    if (!adminDb) {
      console.log(
        "Firebase Admin SDK not initialized, skipping Firestore check"
      );
      return null;
    }

    const docRef = adminDb.collection("players").doc(leagueId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();

      // data가 존재하는지 확인
      if (!data) {
        console.log(`No data found for league ${leagueId}`);
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
            `Player data is more than 24 hours old, fetching new data for league ${leagueId}`
          );
          return null;
        }

        console.log(
          `Using cached player data for league ${leagueId} (last updated: ${lastUpdated.toISOString()})`
        );
        return data.players;
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting player data from Firebase:", error);
    return null;
  }
}

/**
 * Firebase에 선수 데이터 저장
 */
async function storePlayersToFirebase(leagueId: string, players: any[]) {
  try {
    if (!adminDb) {
      console.log("Firebase Admin SDK not initialized, skipping data storage");
      return false;
    }

    const docRef = adminDb.collection("players").doc(leagueId);
    await docRef.set({
      players,
      lastUpdated: Timestamp.now(),
    });

    console.log(`Player data stored in Firebase for league ${leagueId}`);
    return true;
  } catch (error) {
    console.error("Error storing player data in Firebase:", error);
    return false;
  }
}

// 목업 데이터 (API 키가 없거나 요청이 실패할 경우 사용)
const mockPlayersData = {
  "premier-league": [
    {
      id: 1,
      name: "엘링 홀란드",
      team: "맨체스터 시티",
      teamLogo: "/teams/man-city.png",
      goals: 27,
      assists: 5,
      shots: 89,
      penalties: 5,
      gamesPlayed: 31,
    },
    {
      id: 2,
      name: "콜 파머",
      team: "첼시",
      teamLogo: "/teams/chelsea.png",
      goals: 22,
      assists: 10,
      shots: 76,
      penalties: 2,
      gamesPlayed: 35,
    },
    {
      id: 3,
      name: "알렉산더 이사크",
      team: "뉴캐슬",
      teamLogo: "/teams/newcastle.png",
      goals: 21,
      assists: 3,
      shots: 65,
      penalties: 1,
      gamesPlayed: 30,
    },
    {
      id: 4,
      name: "손흥민",
      team: "토트넘",
      teamLogo: "/teams/tottenham.png",
      goals: 17,
      assists: 8,
      shots: 58,
      penalties: 0,
      gamesPlayed: 35,
    },
    {
      id: 5,
      name: "페드로 네토",
      team: "울버햄튼",
      teamLogo: "/teams/wolves.png",
      goals: 5,
      assists: 12,
      shots: 34,
      penalties: 0,
      gamesPlayed: 32,
    },
    {
      id: 6,
      name: "케빈 데 브라위너",
      team: "맨체스터 시티",
      teamLogo: "/teams/man-city.png",
      goals: 8,
      assists: 10,
      shots: 45,
      penalties: 0,
      gamesPlayed: 25,
    },
    {
      id: 7,
      name: "올리 왓킨스",
      team: "아스톤 빌라",
      teamLogo: "/teams/aston-villa.png",
      goals: 19,
      assists: 12,
      shots: 68,
      penalties: 0,
      gamesPlayed: 37,
    },
    {
      id: 8,
      name: "모하메드 살라",
      team: "리버풀",
      teamLogo: "/teams/liverpool.png",
      goals: 17,
      assists: 9,
      shots: 72,
      penalties: 3,
      gamesPlayed: 32,
    },
    {
      id: 9,
      name: "브루노 페르난데스",
      team: "맨체스터 유나이티드",
      teamLogo: "/teams/man-utd.png",
      goals: 10,
      assists: 8,
      shots: 54,
      penalties: 3,
      gamesPlayed: 36,
    },
    {
      id: 10,
      name: "마틴 외데고르",
      team: "아스날",
      teamLogo: "/teams/arsenal.png",
      goals: 8,
      assists: 9,
      shots: 48,
      penalties: 0,
      gamesPlayed: 30,
    },
  ],
  // 다른 리그 데이터...
  "champions-league": [
    {
      id: 1,
      name: "킬리안 음바페",
      team: "레알 마드리드",
      teamLogo: "/teams/real-madrid.png",
      goals: 8,
      assists: 3,
      shots: 24,
      penalties: 1,
      gamesPlayed: 6,
    },
    {
      id: 2,
      name: "해리 케인",
      team: "바이에른 뮌헨",
      teamLogo: "/teams/bayern.png",
      goals: 7,
      assists: 5,
      shots: 22,
      penalties: 2,
      gamesPlayed: 6,
    },
    {
      id: 3,
      name: "에를링 홀란드",
      team: "맨체스터 시티",
      teamLogo: "/teams/man-city.png",
      goals: 7,
      assists: 2,
      shots: 20,
      penalties: 1,
      gamesPlayed: 6,
    },
    {
      id: 4,
      name: "비니시우스 주니오르",
      team: "레알 마드리드",
      teamLogo: "/teams/real-madrid.png",
      goals: 6,
      assists: 4,
      shots: 18,
      penalties: 0,
      gamesPlayed: 6,
    },
    {
      id: 5,
      name: "로버트 레반도프스키",
      team: "바르셀로나",
      teamLogo: "/teams/barcelona.png",
      goals: 6,
      assists: 2,
      shots: 19,
      penalties: 2,
      gamesPlayed: 6,
    },
    {
      id: 6,
      name: "필 포든",
      team: "맨체스터 시티",
      teamLogo: "/teams/man-city.png",
      goals: 5,
      assists: 6,
      shots: 15,
      penalties: 0,
      gamesPlayed: 6,
    },
    {
      id: 7,
      name: "라우타로 마르티네스",
      team: "인터 밀란",
      teamLogo: "/teams/inter.png",
      goals: 5,
      assists: 3,
      shots: 17,
      penalties: 1,
      gamesPlayed: 6,
    },
    {
      id: 8,
      name: "자말 무시알라",
      team: "바이에른 뮌헨",
      teamLogo: "/teams/bayern.png",
      goals: 4,
      assists: 7,
      shots: 14,
      penalties: 0,
      gamesPlayed: 6,
    },
    {
      id: 9,
      name: "브라들리 바르콜라",
      team: "바르셀로나",
      teamLogo: "/teams/barcelona.png",
      goals: 4,
      assists: 5,
      shots: 16,
      penalties: 0,
      gamesPlayed: 6,
    },
    {
      id: 10,
      name: "코디 가크포",
      team: "리버풀",
      teamLogo: "/teams/liverpool.png",
      goals: 4,
      assists: 4,
      shots: 13,
      penalties: 0,
      gamesPlayed: 6,
    },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get("league");

  if (!league || !leagueMapping[league]) {
    return NextResponse.json(
      { error: "유효하지 않은 리그 ID입니다." },
      { status: 400 }
    );
  }

  try {
    // 1. Firebase에서 캐시된 데이터 확인
    const cachedData = await getPlayersFromFirebase(league);
    if (cachedData) {
      return NextResponse.json({
        players: cachedData,
        isCache: true,
      });
    }

    // 2. 캐시된 데이터가 없으면 API에서 가져오기
    // football-data.org API 키가 설정되어 있는지 확인
    if (!FOOTBALL_DATA_API_KEY) {
      console.log("API 키가 없어 목업 데이터를 반환합니다.");
      const mockData =
        mockPlayersData[league as keyof typeof mockPlayersData] || [];
      return NextResponse.json({
        players: mockData,
        isCache: false,
      });
    }

    // API에서 득점자 데이터 가져오기
    const leagueId = leagueMapping[league];
    const scorersData = await fetchFromFootballData(
      `competitions/${leagueId}/scorers?limit=20`
    );

    // 데이터 형식 변환
    const formattedData = scorersData.scorers.map((player: any) => {
      return {
        id: player.player.id,
        name: player.player.name,
        team: player.team.name,
        teamLogo: player.team.crest,
        goals: player.goals,
        assists: player.assists || 0,
        shots: player.penalties || 0, // API에서 shots 정보가 없으면 0으로 설정
        penalties: player.penalties || 0,
        gamesPlayed: player.playedMatches,
      };
    });

    // 3. 가져온 데이터를 Firebase에 저장 (비동기적으로)
    storePlayersToFirebase(league, formattedData)
      .then(() => console.log(`Players data for ${league} stored in Firebase`))
      .catch((err) => console.error(`Error storing players data: ${err}`));

    return NextResponse.json({
      players: formattedData,
      isCache: false,
    });
  } catch (error) {
    console.error("플레이어 데이터 가져오기 실패:", error);
    // 에러 발생 시 목업 데이터 반환
    const mockData =
      mockPlayersData[league as keyof typeof mockPlayersData] || [];
    return NextResponse.json({
      players: mockData,
      isCache: false,
    });
  }
}
