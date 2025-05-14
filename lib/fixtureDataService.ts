import { db } from "./firebase";
import { adminDb } from "./firebaseAdmin";
import { collection, doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";

// 리그 ID 매핑
const leagueMapping: Record<string, number> = {
  "premier-league": 2021,
  "la-liga": 2014,
  "serie-a": 2019,
  bundesliga: 2002,
  "ligue-1": 2015,
  "champions-league": 2001,
};

// 데이터 타입 정의
export type FixtureData = {
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
};

export type FixturesCollection = {
  fixtures: FixtureData[];
  groupedFixtures: Record<string, FixtureData[]>;
  lastUpdated: Timestamp;
};

/**
 * Firebase에 경기 일정 데이터 저장
 */
export async function storeFixturesData(
  leagueId: string,
  fixturesData: {
    fixtures: FixtureData[];
    groupedFixtures: Record<string, FixtureData[]>;
  }
) {
  try {
    const docRef = doc(db, "fixtures", leagueId);

    await setDoc(docRef, {
      fixtures: fixturesData.fixtures,
      groupedFixtures: fixturesData.groupedFixtures,
      lastUpdated: Timestamp.now(),
    });

    console.log(`경기 일정 데이터가 Firebase에 저장되었습니다: ${leagueId}`);
    return true;
  } catch (error) {
    console.error("Firebase에 경기 일정 데이터 저장 중 오류 발생:", error);
    return false;
  }
}

/**
 * Firebase에서 경기 일정 데이터 가져오기
 */
export async function getFixturesData(
  leagueId: string
): Promise<FixturesCollection | null> {
  try {
    const docRef = doc(db, "fixtures", leagueId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as FixturesCollection;

      // 마지막 업데이트가 24시간 이상 지났는지 확인
      const lastUpdated = data.lastUpdated.toDate();
      const now = new Date();
      const hoursSinceUpdate =
        (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

      // 24시간 이상 지났으면 null 반환 (새로운 데이터 가져오기)
      if (hoursSinceUpdate >= 24) {
        console.log(
          `경기 일정 데이터가 24시간 이상 지났습니다. 새로운 데이터를 가져옵니다: ${leagueId}`
        );
        return null;
      }

      console.log(
        `Firebase에서 경기 일정 데이터를 가져왔습니다: ${leagueId} (마지막 업데이트: ${lastUpdated.toISOString()})`
      );
      return data;
    }

    return null;
  } catch (error) {
    console.error(
      "Firebase에서 경기 일정 데이터 가져오기 중 오류 발생:",
      error
    );
    return null;
  }
}

/**
 * TanStack Query를 사용하여 경기 일정 데이터를 가져오는 훅
 */
export function useFixturesData(leagueId: string, month?: string) {
  return useQuery({
    queryKey: ["fixturesData", leagueId, month],
    queryFn: async () => {
      console.log(
        `useFixturesData 호출 - 리그 ID: ${leagueId}, 월: ${month || "all"}`
      );

      // API 호출 - 서버 측에서 Firebase 처리
      const url = month
        ? `/api/fixtures?league=${leagueId}&month=${month}`
        : `/api/fixtures?league=${leagueId}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("경기 일정 데이터를 가져오는데 실패했습니다");
      }

      const responseData = await response.json();

      return {
        fixtures: responseData.fixtures,
        groupedFixtures: responseData.groupedFixtures,
        isUsingCache: responseData.isCache || false,
      };
    },
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
    retry: 1,
  });
}
