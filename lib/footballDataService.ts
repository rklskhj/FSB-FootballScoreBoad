import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

// football-data.org API 설정
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY || "";
const FOOTBALL_DATA_BASE_URL =
  process.env.FOOTBALL_DATA_BASE_URL || "https://api.football-data.org/v4";

// 데이터 타입 정의
export type LeagueStandings = {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
  standings: Record<string, any[]>; // 객체 형태로 명확히 타입 지정
  lastUpdated: Timestamp;
};

// football-data.org API 응답 타입 정의
interface FootballDataStanding {
  position: number;
  team: {
    id: number;
    name: string;
    crest: string;
  };
  playedGames: number;
  form: string;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  group?: string;
}

interface FootballDataStandingGroup {
  group?: string;
  type: string;
  table: FootballDataStanding[];
}

// 리액트 쿼리 훅 추가
import { useQuery } from "@tanstack/react-query";

/**
 * TanStack Query를 사용하여 리그 순위 데이터를 가져오는 훅
 */
export function useLeagueStandings(
  leagueId: number,
  season: number,
  options?: { useFirebase?: boolean }
) {
  const useFirebase = options?.useFirebase !== false; // 기본값은 true

  return useQuery({
    queryKey: ["leagueStandings", leagueId, season, useFirebase],
    queryFn: async () => {
      console.log(
        `useLeagueStandings 호출 - 리그 ID: ${leagueId}, 시즌: ${season}`
      );

      // API 호출 - 서버 측에서 Firebase 처리
      const response = await fetch(
        `/api/football?endpoint=competitions/${leagueId}/standings?season=${season}&useFirebase=${useFirebase}`
      );

      if (!response.ok) {
        throw new Error("데이터를 가져오는데 실패했습니다");
      }

      const responseData = await response.json();

      console.log("footballDataService - API 응답 데이터:", responseData);

      if (responseData.mockData) {
        throw new Error(responseData.error || "API 키가 설정되지 않았습니다");
      }

      // API 응답 데이터 변환
      const leagueInfo = {
        id: responseData.competition?.id,
        name: responseData.competition?.name,
        country: responseData.area?.name || "Unknown",
        logo: responseData.competition?.emblem || "",
        flag: responseData.area?.flag || "",
        season: responseData.filters?.season || "2024",
      };

      // standings 데이터 구조 확인
      // 순위 데이터 변환
      let standings = [];

      // Firebase에서 가져온 데이터 구조 처리
      if (responseData.isFirebaseData) {
        if (Array.isArray(responseData.standings)) {
          standings = responseData.standings;
        }
      }
      // API에서 가져온 데이터 구조 처리
      else if (Array.isArray(responseData.standings)) {
        if (
          responseData.standings.length > 0 &&
          responseData.standings[0].table
        ) {
          standings = responseData.standings[0].table.map((standing: any) => ({
            rank: standing.position,
            team: {
              id: standing.team.id,
              name: standing.team.name,
              logo: standing.team.crest || "",
            },
            points: standing.points,
            goalsDiff: standing.goalDifference,
            group:
              responseData.standings[0].group ||
              responseData.standings[0].type ||
              "",
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
            update:
              responseData.season?.lastUpdated || new Date().toISOString(),
          }));
        }
      }

      const result = {
        standings,
        leagueInfo,
        isUsingFirebase: responseData.isFirebaseData || false,
      };
      return result;
    },
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
    retry: 1,
  });
}

export { db };
