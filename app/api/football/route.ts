import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

// football-data.org API 설정
// .env.local에서 환경 변수 로드
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY || "";
const FOOTBALL_DATA_BASE_URL =
  process.env.FOOTBALL_DATA_BASE_URL || "https://api.football-data.org/v4";

// 환경 변수 로드 로그 (개발자 디버깅용)
console.log(
  `🔧 API 설정: 베이스 URL=${FOOTBALL_DATA_BASE_URL}, 키=${
    FOOTBALL_DATA_API_KEY ? "설정됨" : "설정되지 않음"
  }`
);

/**
 * 실제 football-data.org API 데이터를 가져오는 함수
 */
async function fetchFromFootballData(
  endpoint: string,
  params: Record<string, string> = {}
) {
  // API 키가 없으면 즉시 에러 발생
  if (!FOOTBALL_DATA_API_KEY) {
    throw new Error("FOOTBALL_DATA_API_KEY가 설정되지 않았습니다");
  }

  // 파라미터를 쿼리 문자열로 변환
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  // 쿼리 파라미터가 있으면 URL에 추가
  const url = queryString
    ? `${FOOTBALL_DATA_BASE_URL}/${endpoint}?${queryString}`
    : `${FOOTBALL_DATA_BASE_URL}/${endpoint}`;

  console.log(`🔍 API 요청 URL: ${url}`);

  try {
    // football-data.org 공식 문서에 따른 헤더 설정
    const headers: Record<string, string> = {
      "X-Auth-Token": FOOTBALL_DATA_API_KEY,
    };

    console.log(`🔧 API 요청 헤더:`, headers);

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    console.log(`⚡ API 응답 상태: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API 오류 응답: ${errorText}`);
      throw new Error(`API 요청 실패: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(
      `✅ API 응답 받음: ${JSON.stringify(data).substring(0, 100)}...`
    );
    return data;
  } catch (error) {
    console.error(`🚫 football-data.org API 요청 오류:`, error);
    throw error;
  }
}

/**
 * Firebase에서 리그 순위 데이터 가져오기
 */
async function getLeagueStandings(leagueId: number, season: number) {
  try {
    // Firebase Admin이 초기화되지 않았으면 null 반환
    if (!adminDb) {
      console.log(
        "Firebase Admin SDK not initialized, skipping Firestore check"
      );
      return null;
    }

    const docRef = adminDb.collection("leagues").doc(`${leagueId}-${season}`);
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
            `Data is more than 24 hours old, fetching new data for league ${leagueId}`
          );
          return null;
        }

        console.log(
          `Using cached data for league ${leagueId} (last updated: ${lastUpdated.toISOString()})`
        );
        return data;
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting league standings from Firebase:", error);
    return null;
  }
}

/**
 * 리그 순위 데이터를 Firebase에 저장
 */
async function storeLeagueStandings(
  leagueId: number,
  season: number,
  data: any
) {
  try {
    // Firebase Admin이 초기화되지 않았으면 저장 건너뛰기
    if (!adminDb) {
      console.log("Firebase Admin SDK not initialized, skipping data storage");
      return false;
    }

    // 팀 정보와 순위 데이터를 기존 구조에 맞게 변환
    const standingsData: Record<string, any[]> = {};

    if (data.standings && Array.isArray(data.standings)) {
      data.standings.forEach((standingGroup: any, index: number) => {
        if (standingGroup.table && Array.isArray(standingGroup.table)) {
          standingsData[`group_${index}`] = standingGroup.table.map(
            (standing: any) => ({
              rank: standing.position,
              team: {
                id: standing.team.id,
                name: standing.team.name,
                logo: standing.team.crest,
              },
              points: standing.points,
              goalsDiff: standing.goalDifference,
              group: standingGroup.group || standingGroup.type,
              form: standing.form || "",
              status: "same",
              description: "",
              all: {
                played: standing.playedGames,
                win: standing.won,
                draw: standing.draw,
                lose: standing.lost,
                goals: {
                  for: standing.goalsFor,
                  against: standing.goalsAgainst,
                },
              },
              home: {
                played: 0,
                win: 0,
                draw: 0,
                lose: 0,
                goals: {
                  for: 0,
                  against: 0,
                },
              },
              away: {
                played: 0,
                win: 0,
                draw: 0,
                lose: 0,
                goals: {
                  for: 0,
                  against: 0,
                },
              },
              update: data.season?.lastUpdated || new Date().toISOString(),
            })
          );
        }
      });
    }

    const leagueStandings = {
      id: data.competition?.id,
      name: data.competition?.name,
      country: data.area?.name || "Unknown",
      logo: data.competition?.emblem || "",
      flag: data.area?.flag || "",
      season: parseInt(data.filters?.season || season.toString()),
      standings: standingsData,
      lastUpdated: Timestamp.now(),
    };

    // 'leagues' 컬렉션에 저장
    const docRef = adminDb.collection("leagues").doc(`${leagueId}-${season}`);
    await docRef.set(leagueStandings);

    console.log(
      `Successfully stored data for league ${leagueId} season ${season}`
    );
    return true;
  } catch (error) {
    console.error("Error storing league standings in Firebase:", error);
    return false;
  }
}

// API 라우트 핸들러
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint") || "";
  const useFirebase = searchParams.get("useFirebase") === "true";

  // 필수 파라미터 확인
  if (!endpoint) {
    return NextResponse.json(
      { error: "endpoint 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  // Firebase 사용이 요청되고 standings 엔드포인트인 경우
  if (useFirebase && endpoint.includes("standings")) {
    try {
      // competitions/{id}/standings 형식에서 리그 ID 추출
      const leagueId = parseInt(endpoint.split("/")[1]);
      // season 파라미터 추출
      const season = parseInt(searchParams.get("season") || "2024");

      if (!isNaN(leagueId) && !isNaN(season)) {
        console.log(
          `🔥 Firebase에서 리그 ${leagueId} 시즌 ${season} 데이터 조회 시도`
        );

        // Firebase에서 데이터 가져오기
        const firestoreData = await getLeagueStandings(leagueId, season);

        if (firestoreData) {
          console.log(`✅ Firebase에서 리그 ${leagueId} 데이터 조회 성공`);
          console.log(
            "Firebase 데이터 구조:",
            JSON.stringify(firestoreData, null, 2).substring(0, 500) + "..."
          );

          // standings 데이터가 있는지 확인
          if (
            firestoreData.standings &&
            Object.keys(firestoreData.standings).length > 0
          ) {
            console.log("Firebase에서 standings 데이터 발견");

            // standings 데이터의 첫 번째 그룹 확인
            const firstGroupKey = Object.keys(firestoreData.standings)[0];
            const firstGroupData = firestoreData.standings[firstGroupKey];

            if (Array.isArray(firstGroupData) && firstGroupData.length > 0) {
              console.log(
                `Firebase standings 데이터 항목 수: ${firstGroupData.length}`
              );
            } else {
              console.log("Firebase standings 데이터가 비어있거나 배열이 아님");
            }
          } else {
            console.log("Firebase에 standings 데이터가 없음");
          }

          // Firebase 데이터를 football-data.org API 형식으로 변환
          const standingsData =
            (Object.values(firestoreData.standings)[0] as any[]) || [];
          const responseData = {
            competition: {
              id: firestoreData.id,
              name: firestoreData.name,
              area: {
                name: firestoreData.country,
                flag: firestoreData.flag,
              },
              emblem: firestoreData.logo,
            },
            season: {
              id: firestoreData.season,
              lastUpdated: firestoreData.lastUpdated.toDate().toISOString(),
            },
            standings: standingsData,
            isFirebaseData: true,
          };
          return NextResponse.json(responseData);
        }
      }
    } catch (error) {
      console.error("🚫 Firebase 데이터 조회 실패:", error);
      // Firebase 조회 실패 시 API 호출로 진행
    }
  }

  // API 키가 설정되었는지 확인
  if (!FOOTBALL_DATA_API_KEY) {
    console.log(
      "🚨 FOOTBALL_DATA_API_KEY가 설정되지 않아 목업 데이터를 반환합니다"
    );
    return NextResponse.json(
      {
        error:
          "FOOTBALL_DATA_API_KEY가 설정되지 않았습니다. .env.local 파일에 FOOTBALL_DATA_API_KEY=your_api_key_here를 추가하세요.",
        message: "API 키가 없어 목업 데이터를 반환합니다.",
        mockData: true,
        data: getMockData(endpoint, searchParams),
      },
      { status: 200 }
    );
  }

  try {
    // searchParams에서 endpoint를 제외한 나머지 파라미터 추출
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== "endpoint" && key !== "useFirebase") {
        params[key] = value;
      }
    });

    console.log(
      `📡 football-data.org API 요청: ${endpoint}, 파라미터:`,
      params
    );

    // football-data.org API 호출
    const data = await fetchFromFootballData(endpoint, params);

    // API 응답 데이터 로깅
    console.log(
      "API 응답 데이터:",
      JSON.stringify(data, null, 2).substring(0, 500) + "..."
    );

    // standings 데이터 확인
    if (
      data.standings &&
      Array.isArray(data.standings) &&
      data.standings.length > 0
    ) {
      console.log(`API standings 그룹 수: ${data.standings.length}`);

      if (data.standings[0].table && Array.isArray(data.standings[0].table)) {
        console.log(
          `API standings 첫 번째 그룹 항목 수: ${data.standings[0].table.length}`
        );
      }
    } else {
      console.log("API 응답에 standings 데이터가 없거나 형식이 다름");
    }

    // 리그 순위 데이터인 경우 Firebase에 저장
    if (useFirebase && endpoint.includes("standings")) {
      const matches = endpoint.match(
        /competitions\/(\d+)\/standings\?season=(\d+)/
      );
      if (matches && matches.length >= 3) {
        const leagueId = parseInt(matches[1]);
        const season = parseInt(matches[2]);

        // 비동기적으로 Firebase에 저장 (await 없이 호출하여 응답 지연 방지)
        storeLeagueStandings(leagueId, season, data)
          .then(() => console.log("Data stored in Firebase"))
          .catch((err) =>
            console.error("Error storing data in Firebase:", err)
          );
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("⚠️ API 호출 오류:", error);

    // 에러 발생 시 목업 데이터 반환
    const mockData = getMockData(endpoint, searchParams);
    return NextResponse.json(
      {
        error: "API 호출 중 오류가 발생했습니다. 목업 데이터를 반환합니다.",
        mockData: true,
        data: mockData,
      },
      { status: 200 } // 클라이언트에 오류 전파하지 않고 목업 데이터 제공
    );
  }
}

// 목업 데이터 제공 함수
function getMockData(endpoint: string, searchParams: URLSearchParams) {
  // 엔드포인트에 따라 다른 목업 데이터 제공
  // 예: competitions/{id}/standings 엔드포인트의 경우
  if (endpoint.includes("standings")) {
    const league = endpoint.split("/")[1]; // competitions/{id}/standings에서 id 추출
    const season = searchParams.get("season");

    // 프리미어 리그 목업 데이터
    if (league === "2021") {
      // 2021은 football-data.org의 Premier League ID
      return {
        competition: {
          id: 2021,
          name: "Premier League",
          area: {
            name: "England",
            flag: "https://crests.football-data.org/770.svg",
          },
          code: "PL",
          emblem: "https://crests.football-data.org/PL.png",
        },
        season: {
          id: parseInt(season || "2023"),
          startDate: "2023-08-11",
          endDate: "2024-05-19",
          currentMatchday: 38,
          winner: null,
          lastUpdated: "2024-05-10T00:00:00Z",
        },
        standings: [
          {
            type: "TOTAL",
            table: [
              {
                position: 1,
                team: {
                  id: 64,
                  name: "Liverpool FC",
                  crest: "https://crests.football-data.org/64.png",
                },
                playedGames: 35,
                form: "WWDWW",
                won: 25,
                draw: 7,
                lost: 3,
                points: 82,
                goalsFor: 75,
                goalsAgainst: 35,
                goalDifference: 40,
              },
              {
                position: 2,
                team: {
                  id: 65,
                  name: "Manchester City FC",
                  crest: "https://crests.football-data.org/65.png",
                },
                playedGames: 35,
                form: "WWWWD",
                won: 24,
                draw: 8,
                lost: 3,
                points: 80,
                goalsFor: 72,
                goalsAgainst: 32,
                goalDifference: 40,
              },
              {
                position: 3,
                team: {
                  id: 57,
                  name: "Arsenal FC",
                  crest: "https://crests.football-data.org/57.png",
                },
                playedGames: 35,
                form: "WWWLD",
                won: 24,
                draw: 5,
                lost: 6,
                points: 77,
                goalsFor: 83,
                goalsAgainst: 28,
                goalDifference: 55,
              },
            ],
          },
        ],
      };
    }
  }

  // matches 엔드포인트의 경우
  if (endpoint.includes("matches")) {
    return {
      matches: [
        {
          id: 419615,
          competition: {
            id: 2021,
            name: "Premier League",
            emblem: "https://crests.football-data.org/PL.png",
          },
          utcDate: "2024-05-11T11:30:00Z",
          status: "SCHEDULED",
          matchday: 37,
          homeTeam: {
            id: 61,
            name: "Chelsea FC",
            crest: "https://crests.football-data.org/61.png",
            shortName: "Chelsea",
            tla: "CHE",
          },
          awayTeam: {
            id: 65,
            name: "Manchester City FC",
            crest: "https://crests.football-data.org/65.png",
            shortName: "Man City",
            tla: "MCI",
          },
          score: {
            winner: null,
            fullTime: {
              home: null,
              away: null,
            },
            halfTime: {
              home: null,
              away: null,
            },
          },
        },
      ],
    };
  }

  // 기본 목업 데이터
  return {
    message: "목업 데이터가 제공되지 않는 엔드포인트입니다.",
  };
}
