import { db } from "./firebase";
import { collection, doc, setDoc, getDoc, Timestamp } from "firebase/firestore";

// 챔피언스리그 데이터 타입 정의
export type ChampionsLeagueData = {
  standings: any[];
  matches: any[];
  scorers: any[];
  lastUpdated: Timestamp;
};

/**
 * 챔피언스리그 데이터를 Firebase에 저장
 */
export const storeChampionsLeagueData = async (
  standings: any[],
  matches: any[],
  scorers: any[]
) => {
  try {
    const championsLeagueData: ChampionsLeagueData = {
      standings,
      matches,
      scorers,
      lastUpdated: Timestamp.now(),
    };

    // 'champions-league' 컬렉션에 저장, 문서 ID는 'current-season'
    const docRef = doc(db, "champions-league", "current-season");
    await setDoc(docRef, championsLeagueData);

    console.log("Successfully updated Champions League data");
    return championsLeagueData;
  } catch (error) {
    console.error("Error storing Champions League data:", error);
    throw error;
  }
};

/**
 * Firebase에서 챔피언스리그 데이터 가져오기
 */
export const getChampionsLeagueData =
  async (): Promise<ChampionsLeagueData | null> => {
    try {
      const docRef = doc(db, "champions-league", "current-season");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as ChampionsLeagueData;

        // 마지막 업데이트가 24시간 이상 지났는지 확인
        const lastUpdated = data.lastUpdated.toDate();
        const now = new Date();
        const hoursSinceUpdate =
          (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

        // 데이터가 있으면 반환
        console.log(
          `Using cached Champions League data (last updated: ${lastUpdated.toISOString()})`
        );
        return data;
      }

      return null;
    } catch (error) {
      console.error("Error getting Champions League data:", error);
      return null;
    }
  };
