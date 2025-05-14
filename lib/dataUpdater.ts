import { fetchAndStoreLeagueStandings } from "./footballDataService";

// 업데이트할 리그 목록 (유럽 5대 리그)
const LEAGUES_TO_UPDATE = [
  { id: 39, name: "프리미어 리그" },
  { id: 140, name: "라리가" },
  { id: 135, name: "세리에 A" },
  { id: 78, name: "분데스리가" },
  { id: 61, name: "리그 1" },
];

// 시즌 계산 (API-Football 무료 플랜은 2021-2023 시즌만 지원)
const getCurrentSeason = () => {
  // 무료 플랜은 2021-2023 시즌만 지원하므로 2023 반환
  return 2023;

  // 유료 플랜 사용 시 아래 주석을 해제하고 위 코드를 주석 처리하세요
  /*
  const now = new Date();
  const month = now.getMonth(); // 0부터 시작 (0 = 1월)
  const year = now.getFullYear();
  
  // 8월 이전이면 전년도 시즌, 8월 이후면 현재 년도 시즌
  // 예: 2024년 7월 = 2023-2024 시즌 = 2023
  //     2024년 8월 = 2024-2025 시즌 = 2024
  return month < 7 ? year - 1 : year;
  */
};

/**
 * 모든 리그의 데이터를 업데이트
 */
export const updateAllLeaguesData = async () => {
  console.log("Starting update process for all leagues...");
  const season = getCurrentSeason();
  console.log(`Using season: ${season}`);

  for (const league of LEAGUES_TO_UPDATE) {
    try {
      console.log(`Updating data for ${league.name} (ID: ${league.id})`);
      await fetchAndStoreLeagueStandings(league.id, season);

      // API 제한 때문에 요청 사이에 1초 지연
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error updating ${league.name}:`, error);
    }
  }

  console.log("All leagues updated successfully");
};

/**
 * 특정 리그의 데이터를 업데이트
 */
export const updateLeagueData = async (leagueId: number) => {
  const season = getCurrentSeason();
  console.log(`Updating league ${leagueId} for season ${season}`);
  return fetchAndStoreLeagueStandings(leagueId, season);
};
