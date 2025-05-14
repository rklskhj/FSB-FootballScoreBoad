import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

// API 키와 기본 URL 설정
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4";

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
 * Firebase에서 챔피언스리그 데이터 가져오기
 */
async function getChampionsLeagueData() {
  try {
    // Firebase Admin이 초기화되지 않았으면 null 반환
    if (!adminDb) {
      console.log(
        "Firebase Admin SDK not initialized, skipping Firestore check"
      );
      return null;
    }

    const docRef = adminDb.collection("champions-league").doc("current-season");
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();

      // 마지막 업데이트가 24시간 이상 지났는지 확인
      const lastUpdated = data?.lastUpdated?.toDate();
      if (lastUpdated) {
        const now = new Date();
        const hoursSinceUpdate =
          (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

        // 24시간 이상 지났으면 새로운 데이터 가져오기
        if (hoursSinceUpdate >= 24) {
          console.log(
            "Champions League data is more than 24 hours old, fetching new data"
          );
          return null;
        }

        console.log(
          `Using cached Champions League data (last updated: ${lastUpdated.toISOString()})`
        );
        return data;
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting Champions League data from Firebase:", error);
    return null;
  }
}

/**
 * 챔피언스리그 데이터를 Firebase에 저장
 */
async function storeChampionsLeagueData(
  standings: any[],
  matches: any[],
  scorers: any[]
) {
  try {
    // Firebase Admin이 초기화되지 않았으면 저장 건너뛰기
    if (!adminDb) {
      console.log("Firebase Admin SDK not initialized, skipping data storage");
      return false;
    }

    await adminDb.collection("champions-league").doc("current-season").set({
      standings,
      matches,
      scorers,
      lastUpdated: Timestamp.now(),
    });

    console.log("Champions League data stored in Firebase");
    return true;
  } catch (error) {
    console.error("Error storing Champions League data in Firebase:", error);
    return false;
  }
}

// 목업 챔피언스리그 데이터
const mockChampionsLeagueData = {
  standings: [
    {
      group: "LEAGUE_PHASE",
      table: [
        {
          position: 1,
          team: {
            id: 108,
            name: "FC Internazionale Milano",
            crest: "https://crests.football-data.org/108.png",
          },
          playedGames: 14,
          form: "WWDWW",
          won: 10,
          draw: 3,
          lost: 1,
          points: 33,
          goalsFor: 26,
          goalsAgainst: 11,
          goalDifference: 15,
        },
        {
          position: 2,
          team: {
            id: 524,
            name: "Paris Saint-Germain FC",
            crest: "https://crests.football-data.org/524.png",
          },
          playedGames: 16,
          form: "WWWWL",
          won: 9,
          draw: 4,
          lost: 3,
          points: 31,
          goalsFor: 28,
          goalsAgainst: 14,
          goalDifference: 14,
        },
        {
          position: 3,
          team: {
            id: 57,
            name: "Arsenal FC",
            crest: "https://crests.football-data.org/57.png",
          },
          playedGames: 12,
          form: "WLWWW",
          won: 9,
          draw: 1,
          lost: 2,
          points: 28,
          goalsFor: 24,
          goalsAgainst: 10,
          goalDifference: 14,
        },
        {
          position: 4,
          team: {
            id: 81,
            name: "FC Barcelona",
            crest: "https://crests.football-data.org/81.png",
          },
          playedGames: 12,
          form: "LWWWL",
          won: 9,
          draw: 0,
          lost: 3,
          points: 27,
          goalsFor: 28,
          goalsAgainst: 10,
          goalDifference: 18,
        },
        {
          position: 5,
          team: {
            id: 5,
            name: "FC Bayern München",
            crest: "https://crests.football-data.org/5.png",
          },
          playedGames: 12,
          form: "DWWWL",
          won: 8,
          draw: 2,
          lost: 2,
          points: 26,
          goalsFor: 27,
          goalsAgainst: 13,
          goalDifference: 14,
        },
        {
          position: 6,
          team: {
            id: 86,
            name: "Real Madrid CF",
            crest: "https://crests.football-data.org/86.png",
          },
          playedGames: 12,
          form: "LWWWL",
          won: 8,
          draw: 1,
          lost: 3,
          points: 25,
          goalsFor: 22,
          goalsAgainst: 14,
          goalDifference: 8,
        },
        {
          position: 7,
          team: {
            id: 58,
            name: "Aston Villa FC",
            crest: "https://crests.football-data.org/58.png",
          },
          playedGames: 12,
          form: "WLWWW",
          won: 8,
          draw: 0,
          lost: 4,
          points: 24,
          goalsFor: 20,
          goalsAgainst: 14,
          goalDifference: 6,
        },
        {
          position: 8,
          team: {
            id: 4,
            name: "Borussia Dortmund",
            crest: "https://crests.football-data.org/4.png",
          },
          playedGames: 12,
          form: "WLWWW",
          won: 7,
          draw: 3,
          lost: 2,
          points: 24,
          goalsFor: 22,
          goalsAgainst: 13,
          goalDifference: 9,
        },
        {
          position: 9,
          team: {
            id: 65,
            name: "Manchester City FC",
            crest: "https://crests.football-data.org/65.png",
          },
          playedGames: 12,
          form: "LWLWW",
          won: 7,
          draw: 2,
          lost: 3,
          points: 23,
          goalsFor: 21,
          goalsAgainst: 12,
          goalDifference: 9,
        },
        {
          position: 10,
          team: {
            id: 496,
            name: "Juventus FC",
            crest: "https://crests.football-data.org/496.png",
          },
          playedGames: 12,
          form: "WDWLW",
          won: 7,
          draw: 2,
          lost: 3,
          points: 23,
          goalsFor: 19,
          goalsAgainst: 11,
          goalDifference: 8,
        },
        {
          position: 11,
          team: {
            id: 64,
            name: "Liverpool FC",
            crest: "https://crests.football-data.org/64.png",
          },
          playedGames: 12,
          form: "WDLWW",
          won: 7,
          draw: 1,
          lost: 4,
          points: 22,
          goalsFor: 20,
          goalsAgainst: 14,
          goalDifference: 6,
        },
        {
          position: 12,
          team: {
            id: 78,
            name: "Club Atlético de Madrid",
            crest: "https://crests.football-data.org/78.png",
          },
          playedGames: 12,
          form: "WLWDL",
          won: 6,
          draw: 3,
          lost: 3,
          points: 21,
          goalsFor: 18,
          goalsAgainst: 14,
          goalDifference: 4,
        },
        {
          position: 13,
          team: {
            id: 503,
            name: "FC Porto",
            crest: "https://crests.football-data.org/503.png",
          },
          playedGames: 12,
          form: "WLWWL",
          won: 6,
          draw: 3,
          lost: 3,
          points: 21,
          goalsFor: 17,
          goalsAgainst: 13,
          goalDifference: 4,
        },
        {
          position: 14,
          team: {
            id: 851,
            name: "Bayer 04 Leverkusen",
            crest: "https://crests.football-data.org/851.png",
          },
          playedGames: 12,
          form: "WLWDL",
          won: 6,
          draw: 2,
          lost: 4,
          points: 20,
          goalsFor: 19,
          goalsAgainst: 15,
          goalDifference: 4,
        },
        {
          position: 15,
          team: {
            id: 1887,
            name: "Sporting Clube de Portugal",
            crest: "https://crests.football-data.org/1887.png",
          },
          playedGames: 12,
          form: "LWLWW",
          won: 6,
          draw: 2,
          lost: 4,
          points: 20,
          goalsFor: 18,
          goalsAgainst: 14,
          goalDifference: 4,
        },
        {
          position: 16,
          team: {
            id: 73,
            name: "Tottenham Hotspur FC",
            crest: "https://crests.football-data.org/73.png",
          },
          playedGames: 12,
          form: "LWDWL",
          won: 6,
          draw: 1,
          lost: 5,
          points: 19,
          goalsFor: 17,
          goalsAgainst: 16,
          goalDifference: 1,
        },
        {
          position: 17,
          team: {
            id: 98,
            name: "AC Milan",
            crest: "https://crests.football-data.org/98.png",
          },
          playedGames: 12,
          form: "WDLLW",
          won: 5,
          draw: 3,
          lost: 4,
          points: 18,
          goalsFor: 16,
          goalsAgainst: 15,
          goalDifference: 1,
        },
        {
          position: 18,
          team: {
            id: 721,
            name: "RB Leipzig",
            crest: "https://crests.football-data.org/721.png",
          },
          playedGames: 12,
          form: "WLWDL",
          won: 5,
          draw: 3,
          lost: 4,
          points: 18,
          goalsFor: 15,
          goalsAgainst: 15,
          goalDifference: 0,
        },
        {
          position: 19,
          team: {
            id: 76,
            name: "Sevilla FC",
            crest: "https://crests.football-data.org/76.png",
          },
          playedGames: 12,
          form: "LWDLW",
          won: 5,
          draw: 2,
          lost: 5,
          points: 17,
          goalsFor: 16,
          goalsAgainst: 16,
          goalDifference: 0,
        },
        {
          position: 20,
          team: {
            id: 610,
            name: "PSV",
            crest: "https://crests.football-data.org/610.png",
          },
          playedGames: 12,
          form: "LWDLD",
          won: 5,
          draw: 2,
          lost: 5,
          points: 17,
          goalsFor: 15,
          goalsAgainst: 16,
          goalDifference: -1,
        },
        {
          position: 21,
          team: {
            id: 1,
            name: "1. FC Köln",
            crest: "https://crests.football-data.org/1.png",
          },
          playedGames: 12,
          form: "LDWLL",
          won: 5,
          draw: 1,
          lost: 6,
          points: 16,
          goalsFor: 14,
          goalsAgainst: 17,
          goalDifference: -3,
        },
        {
          position: 22,
          team: {
            id: 102,
            name: "Bologna FC 1909",
            crest: "https://crests.football-data.org/102.png",
          },
          playedGames: 12,
          form: "LDLWL",
          won: 4,
          draw: 4,
          lost: 4,
          points: 16,
          goalsFor: 13,
          goalsAgainst: 14,
          goalDifference: -1,
        },
        {
          position: 23,
          team: {
            id: 1903,
            name: "Sport Lisboa e Benfica",
            crest: "https://crests.football-data.org/1903.png",
          },
          playedGames: 12,
          form: "LDWLL",
          won: 4,
          draw: 3,
          lost: 5,
          points: 15,
          goalsFor: 14,
          goalsAgainst: 16,
          goalDifference: -2,
        },
        {
          position: 24,
          team: {
            id: 674,
            name: "Celtic FC",
            crest: "https://crests.football-data.org/674.png",
          },
          playedGames: 12,
          form: "LWLLD",
          won: 4,
          draw: 2,
          lost: 6,
          points: 14,
          goalsFor: 13,
          goalsAgainst: 17,
          goalDifference: -4,
        },
        {
          position: 25,
          team: {
            id: 6885,
            name: "FK Crvena Zvezda",
            crest: "https://crests.football-data.org/6885.png",
          },
          playedGames: 12,
          form: "LLDLW",
          won: 3,
          draw: 3,
          lost: 6,
          points: 12,
          goalsFor: 11,
          goalsAgainst: 18,
          goalDifference: -7,
        },
        {
          position: 26,
          team: {
            id: 678,
            name: "AFC Ajax",
            crest: "https://crests.football-data.org/678.png",
          },
          playedGames: 12,
          form: "LWLLD",
          won: 3,
          draw: 2,
          lost: 7,
          points: 11,
          goalsFor: 12,
          goalsAgainst: 19,
          goalDifference: -7,
        },
        {
          position: 27,
          team: {
            id: 5455,
            name: "SK Sturm Graz",
            crest: "https://crests.football-data.org/5455.png",
          },
          playedGames: 12,
          form: "LDLWL",
          won: 3,
          draw: 2,
          lost: 7,
          points: 11,
          goalsFor: 10,
          goalsAgainst: 18,
          goalDifference: -8,
        },
        {
          position: 28,
          team: {
            id: 889,
            name: "Shakhtar Donetsk",
            crest: "https://crests.football-data.org/889.png",
          },
          playedGames: 12,
          form: "LLDWL",
          won: 3,
          draw: 1,
          lost: 8,
          points: 10,
          goalsFor: 11,
          goalsAgainst: 20,
          goalDifference: -9,
        },
        {
          position: 29,
          team: {
            id: 654,
            name: "Rangers FC",
            crest: "https://crests.football-data.org/654.png",
          },
          playedGames: 12,
          form: "LDLLL",
          won: 2,
          draw: 4,
          lost: 6,
          points: 10,
          goalsFor: 10,
          goalsAgainst: 19,
          goalDifference: -9,
        },
        {
          position: 30,
          team: {
            id: 1871,
            name: "BSC Young Boys",
            crest: "https://crests.football-data.org/1871.png",
          },
          playedGames: 12,
          form: "LDLLL",
          won: 2,
          draw: 3,
          lost: 7,
          points: 9,
          goalsFor: 9,
          goalsAgainst: 19,
          goalDifference: -10,
        },
        {
          position: 31,
          team: {
            id: 550,
            name: "Dinamo Zagreb",
            crest: "https://crests.football-data.org/550.png",
          },
          playedGames: 12,
          form: "LLLLD",
          won: 2,
          draw: 3,
          lost: 7,
          points: 9,
          goalsFor: 8,
          goalsAgainst: 19,
          goalDifference: -11,
        },
        {
          position: 32,
          team: {
            id: 1877,
            name: "Feyenoord Rotterdam",
            crest: "https://crests.football-data.org/1877.png",
          },
          playedGames: 12,
          form: "LLLWL",
          won: 2,
          draw: 2,
          lost: 8,
          points: 8,
          goalsFor: 9,
          goalsAgainst: 21,
          goalDifference: -12,
        },
        {
          position: 33,
          team: {
            id: 2282,
            name: "Club Brugge KV",
            crest: "https://crests.football-data.org/2282.png",
          },
          playedGames: 12,
          form: "LLLLD",
          won: 1,
          draw: 3,
          lost: 8,
          points: 6,
          goalsFor: 7,
          goalsAgainst: 20,
          goalDifference: -13,
        },
        {
          position: 34,
          team: {
            id: 523,
            name: "Lille OSC",
            crest: "https://crests.football-data.org/523.png",
          },
          playedGames: 12,
          form: "LLLLL",
          won: 1,
          draw: 3,
          lost: 8,
          points: 6,
          goalsFor: 6,
          goalsAgainst: 20,
          goalDifference: -14,
        },
        {
          position: 35,
          team: {
            id: 1876,
            name: "FC Salzburg",
            crest: "https://crests.football-data.org/1876.png",
          },
          playedGames: 12,
          form: "LLLLL",
          won: 1,
          draw: 2,
          lost: 9,
          points: 5,
          goalsFor: 6,
          goalsAgainst: 22,
          goalDifference: -16,
        },
        {
          position: 36,
          team: {
            id: 5000,
            name: "Slovan Bratislava",
            crest: "https://crests.football-data.org/5000.png",
          },
          playedGames: 12,
          form: "LLLLL",
          won: 0,
          draw: 2,
          lost: 10,
          points: 2,
          goalsFor: 4,
          goalsAgainst: 24,
          goalDifference: -20,
        },
      ],
    },
  ],
  competition: {
    id: 2001,
    name: "UEFA Champions League",
    code: "CL",
    type: "CUP",
    emblem: "https://crests.football-data.org/CL.png",
  },
  season: {
    id: 1673,
    startDate: "2024-09-17",
    endDate: "2025-05-31",
    currentMatchday: 8,
    winner: null,
  },
  area: {
    id: 2077,
    name: "Europe",
    code: "EUR",
    flag: null,
  },
  matches: [
    {
      id: 1,
      date: "2025-05-07T21:00:00Z",
      status: "FINISHED",
      matchday: 14,
      stage: "SEMI_FINALS",
      homeTeam: "Paris Saint-Germain FC",
      homeTeamLogo: "https://crests.football-data.org/524.png",
      awayTeam: "Arsenal FC",
      awayTeamLogo: "https://crests.football-data.org/57.png",
      score: { home: 2, away: 1 },
      venue: "Parc des Princes",
    },
    {
      id: 2,
      date: "2025-05-06T21:00:00Z",
      status: "FINISHED",
      matchday: 14,
      stage: "SEMI_FINALS",
      homeTeam: "FC Internazionale Milano",
      homeTeamLogo: "https://crests.football-data.org/108.png",
      awayTeam: "FC Barcelona",
      awayTeamLogo: "https://crests.football-data.org/81.png",
      score: { home: 4, away: 3 },
      venue: "San Siro",
    },
    {
      id: 3,
      date: "2025-04-30T21:00:00Z",
      status: "FINISHED",
      matchday: 13,
      stage: "SEMI_FINALS",
      homeTeam: "FC Barcelona",
      homeTeamLogo: "https://crests.football-data.org/81.png",
      awayTeam: "FC Internazionale Milano",
      awayTeamLogo: "https://crests.football-data.org/108.png",
      score: { home: 3, away: 3 },
      venue: "Camp Nou",
    },
    {
      id: 4,
      date: "2025-04-29T21:00:00Z",
      status: "FINISHED",
      matchday: 13,
      stage: "SEMI_FINALS",
      homeTeam: "Arsenal FC",
      homeTeamLogo: "https://crests.football-data.org/57.png",
      awayTeam: "Paris Saint-Germain FC",
      awayTeamLogo: "https://crests.football-data.org/524.png",
      score: { home: 0, away: 1 },
      venue: "Emirates Stadium",
    },
    {
      id: 5,
      date: "2025-05-31T21:00:00Z",
      status: "SCHEDULED",
      matchday: 15,
      stage: "FINAL",
      homeTeam: "Paris Saint-Germain FC",
      homeTeamLogo: "https://crests.football-data.org/524.png",
      awayTeam: "FC Internazionale Milano",
      awayTeamLogo: "https://crests.football-data.org/108.png",
      score: { home: null, away: null },
      venue: "Wembley Stadium",
    },
  ],
  scorers: [
    {
      player: {
        id: 1001,
        name: "Sehrou Guirassy",
        nationality: "Guinea",
      },
      team: {
        id: 4,
        name: "Borussia Dortmund",
        crest: "https://crests.football-data.org/4.png",
      },
      goals: 13,
      assists: 4,
      playedMatches: 14,
    },
    {
      player: {
        id: 1002,
        name: "Raphinha",
        nationality: "Brazil",
      },
      team: {
        id: 81,
        name: "FC Barcelona",
        crest: "https://crests.football-data.org/81.png",
      },
      goals: 13,
      assists: 8,
      playedMatches: 14,
    },
    {
      player: {
        id: 1003,
        name: "Robert Lewandowski",
        nationality: "Poland",
      },
      team: {
        id: 81,
        name: "FC Barcelona",
        crest: "https://crests.football-data.org/81.png",
      },
      goals: 11,
      assists: 0,
      playedMatches: 13,
    },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "standings"; // standings, matches, scorers, all
  const useFirebase = searchParams.get("useFirebase") === "true";

  try {
    // Firebase에서 데이터 가져오기 시도 (useFirebase 파라미터가 true인 경우)
    if (useFirebase) {
      try {
        const firestoreData = await getChampionsLeagueData();
        if (firestoreData) {
          console.log("Using Champions League data from Firebase");

          if (type === "standings") {
            return NextResponse.json({
              standings: firestoreData.standings,
              isCache: true,
            });
          } else if (type === "matches") {
            return NextResponse.json({
              matches: firestoreData.matches,
              isCache: true,
            });
          } else if (type === "scorers") {
            return NextResponse.json({
              scorers: firestoreData.scorers,
              isCache: true,
            });
          } else if (type === "all") {
            return NextResponse.json({
              standings: firestoreData.standings,
              matches: firestoreData.matches,
              scorers: firestoreData.scorers,
              isCache: true,
            });
          }
        }
      } catch (error) {
        console.error("Firebase 데이터 가져오기 실패:", error);
        // Firebase 실패 시 API 호출 또는 목업 데이터 사용으로 진행
      }
    }

    // football-data.org API 키가 설정되어 있는지 확인
    if (!FOOTBALL_DATA_API_KEY) {
      console.log("API 키가 없어 목업 데이터를 반환합니다.");

      if (type === "standings") {
        return NextResponse.json(mockChampionsLeagueData);
      } else if (type === "matches") {
        return NextResponse.json({ matches: mockChampionsLeagueData.matches });
      } else if (type === "scorers") {
        return NextResponse.json({ scorers: mockChampionsLeagueData.scorers });
      } else if (type === "all") {
        // 모든 데이터를 한 번에 반환
        return NextResponse.json({
          standings: mockChampionsLeagueData.standings,
          matches: mockChampionsLeagueData.matches,
          scorers: mockChampionsLeagueData.scorers,
        });
      } else {
        return NextResponse.json(
          { error: "지원하지 않는 데이터 타입입니다." },
          { status: 400 }
        );
      }
    }

    // API에서 챔피언스리그 데이터 가져오기
    let endpoint = "";

    if (type === "all") {
      // 모든 데이터를 한 번에 가져오기 위해 여러 API 호출
      try {
        const [standingsData, matchesData, scorersData] = await Promise.all([
          fetchFromFootballData("competitions/CL/standings"),
          fetchFromFootballData("competitions/CL/matches"),
          fetchFromFootballData("competitions/CL/scorers"),
        ]);

        // Firebase에 데이터 저장 (서버 사이드에서 처리)
        if (useFirebase) {
          try {
            await storeChampionsLeagueData(
              standingsData.standings,
              matchesData.matches,
              scorersData.scorers
            );
            console.log(
              "챔피언스리그 데이터를 Firebase에 성공적으로 저장했습니다."
            );
          } catch (error) {
            console.error("Firebase에 데이터 저장 실패:", error);
            // 저장 실패해도 API 데이터는 반환
          }
        }

        return NextResponse.json({
          standings: standingsData.standings,
          matches: matchesData.matches,
          scorers: scorersData.scorers,
        });
      } catch (error) {
        console.error("모든 데이터 가져오기 실패:", error);
        // 에러 발생 시 목업 데이터 반환
        return NextResponse.json({
          standings: mockChampionsLeagueData.standings,
          matches: mockChampionsLeagueData.matches,
          scorers: mockChampionsLeagueData.scorers,
        });
      }
    }

    switch (type) {
      case "standings":
        endpoint = "competitions/CL/standings";
        break;
      case "matches":
        endpoint = "competitions/CL/matches";
        break;
      case "scorers":
        endpoint = "competitions/CL/scorers";
        break;
      default:
        return NextResponse.json(
          { error: "지원하지 않는 데이터 타입입니다." },
          { status: 400 }
        );
    }

    const data = await fetchFromFootballData(endpoint);

    // 개별 데이터 요청 시에는 Firebase에 저장하지 않음 (all 요청에서만 저장)

    return NextResponse.json(data);
  } catch (error) {
    console.error("챔피언스리그 데이터 가져오기 실패:", error);

    // 에러 발생 시 목업 데이터 반환
    if (type === "standings") {
      return NextResponse.json(mockChampionsLeagueData);
    } else if (type === "matches") {
      return NextResponse.json({ matches: mockChampionsLeagueData.matches });
    } else if (type === "scorers") {
      return NextResponse.json({ scorers: mockChampionsLeagueData.scorers });
    } else if (type === "all") {
      return NextResponse.json({
        standings: mockChampionsLeagueData.standings,
        matches: mockChampionsLeagueData.matches,
        scorers: mockChampionsLeagueData.scorers,
      });
    } else {
      return NextResponse.json(
        { error: "데이터 가져오기 실패" },
        { status: 500 }
      );
    }
  }
}
