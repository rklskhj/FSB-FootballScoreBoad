// 팀 이름 영어→한글 매핑 정보
interface TeamMapping {
  [key: string]: string;
}

interface LeagueTeams {
  [leagueId: string]: TeamMapping;
}

// 리그별 팀 이름 매핑 정보
export const teamNamesByLeague: LeagueTeams = {
  // 프리미어 리그 (football-data.org ID: 2021)
  "2021": {
    "Manchester City FC": "맨체스터 시티",
    "Liverpool FC": "리버풀",
    "Arsenal FC": "아스널",
    "Aston Villa FC": "아스톤 빌라",
    "Tottenham Hotspur FC": "토트넘 홋스퍼",
    "Manchester United FC": "맨체스터 유나이티드",
    "Newcastle United FC": "뉴캐슬 유나이티드",
    "Chelsea FC": "첼시",
    "Brighton & Hove Albion FC": "브라이튼",
    "West Ham United FC": "웨스트햄",
    "Crystal Palace FC": "크리스탈 팰리스",
    "Wolverhampton Wanderers FC": "울버햄튼",
    "Nottingham Forest FC": "노팅엄 포레스트",
    "Fulham FC": "풀럼",
    "Bournemouth FC": "본머스",
    "Everton FC": "에버턴",
    "Ipswich Town FC": "입스위치 타운",
    "Leicester City FC": "레스터 시티",
    "Southampton FC": "사우샘프턴",
    "Brentford FC": "브렌트포드",
    "AFC Bournemouth": "본머스",
  },

  // 라리가 (football-data.org ID: 2014)
  "2014": {
    "Real Madrid CF": "레알 마드리드",
    "FC Barcelona": "바르셀로나",
    "Club Atlético de Madrid": "아틀레티코 마드리드",
    "Athletic Club": "아틀레틱 빌바오",
    "Girona FC": "지로나",
    "Real Sociedad de Fútbol": "레알 소시에다드",
    "Real Betis Balompié": "레알 베티스",
    "Villarreal CF": "비야레알",
    "Valencia CF": "발렌시아",
    "Getafe CF": "헤타페",
    "Sevilla FC": "세비야",
    "CA Osasuna": "오사수나",
    "Rayo Vallecano de Madrid": "라요 바예카노",
    "RCD Mallorca": "마요르카",
    "Las Palmas": "라스 팔마스",
    "RCD Espanyol de Barcelona": "에스파뇰",
    "RC Celta de Vigo": "셀타 비고",
    "CD Leganés": "레가네스",
    "Deportivo Alavés": "알라베스",
    "UD Las Palmas": "라스 팔마스",
    "Real Valladolid CF": "바야돌리드",
  },

  // 분데스리가 (football-data.org ID: 2002)
  "2002": {
    "FC Bayern München": "바이에른 뮌헨",
    "Borussia Dortmund": "도르트문트",
    "Bayer 04 Leverkusen": "레버쿠젠",
    "RB Leipzig": "라이프치히",
    "VfB Stuttgart": "슈투트가르트",
    "Eintracht Frankfurt": "프랑크푸르트",
    "VfL Wolfsburg": "볼프스부르크",
    "TSG 1899 Hoffenheim": "호펜하임",
    "SC Freiburg": "프라이부르크",
    "1. FSV Mainz 05": "마인츠",
    "FC Köln": "쾰른",
    "Borussia Mönchengladbach": "묀헨글라트바흐",
    "1. FC Union Berlin": "우니온 베를린",
    "FC Augsburg": "아우크스부르크",
    "SV Werder Bremen": "베르더 브레멘",
    "Holstein Kiel": "홀슈타인 킬",
    "1. FC Heidenheim 1846": "하이덴하임",
    "FC St. Pauli 1910": "장크트 파울리",
    "VfL Bochum 1848": "보훔",
  },

  // 세리에 A (football-data.org ID: 2019)
  "2019": {
    "FC Internazionale Milano": "인터 밀란",
    "Juventus FC": "유벤투스",
    "AC Milan": "AC 밀란",
    "Atalanta BC": "아탈란타",
    "AS Roma": "로마",
    "SS Lazio": "라치오",
    "SSC Napoli": "나폴리",
    "ACF Fiorentina": "피오렌티나",
    "Bologna FC 1909": "볼로냐",
    "Torino FC": "토리노",
    "Udinese Calcio": "우디네세",
    "Genoa CFC": "제노아",
    "AC Monza": "몬자",
    "Cagliari Calcio": "칼리아리",
    "Empoli FC": "엠폴리",
    "US Lecce": "레체",
    "Hellas Verona FC": "베로나",
    "Parma Calcio 1913": "파르마",
    "Como 1907": "코모",
    "Venezia FC": "베네치아",
  },

  // 리그 1 (football-data.org ID: 2015)
  "2015": {
    "Paris Saint-Germain FC": "파리 생제르맹",
    "AS Monaco FC": "모나코",
    "Olympique de Marseille": "마르세유",
    "Lille OSC": "LOSC 릴",
    "Olympique Lyonnais": "리옹",
    "Stade Rennais FC 1901": "렌",
    "OGC Nice": "니스",
    "Racing Club de Lens": "랑스",
    "Stade Brestois 29": "브레스트",
    "FC Nantes": "낭트",
    "Montpellier HSC": "몽펠리에",
    "Stade de Reims": "랭스",
    "AS Saint-Étienne": "생테티엔",
    "Toulouse FC": "툴루즈",
    "Angers SCO": "앙제",
    "Le Havre AC": "르아브르",
    "AJ Auxerre": "오세르",
    "RC Strasbourg Alsace": "스트라스부르",
  },
};

/**
 * 팀 이름을 한글로 변환하는 함수
 * @param name 영어 팀 이름
 * @param leagueId 리그 ID
 * @returns 한글 팀 이름 (번역이 없을 경우 원래 이름)
 */
export function translateTeamName(name: string, leagueId?: number): string {
  // 팀 이름 번역 맵핑
  const teamNameMap: Record<string, string> = {
    // 프리미어 리그
    "Manchester City FC": "맨체스터 시티",
    "Arsenal FC": "아스날",
    "Liverpool FC": "리버풀",
    "Aston Villa FC": "아스톤 빌라",
    "Tottenham Hotspur FC": "토트넘",
    "Manchester United FC": "맨체스터 유나이티드",
    "Newcastle United FC": "뉴캐슬",
    "Chelsea FC": "첼시",
    "West Ham United FC": "웨스트햄",
    "Brighton & Hove Albion FC": "브라이튼",
    "Wolverhampton Wanderers FC": "울버햄튼",
    "Crystal Palace FC": "크리스탈 팰리스",
    "Everton FC": "에버튼",
    "Brentford FC": "브렌트포드",
    "Nottingham Forest FC": "노팅엄 포레스트",
    "Fulham FC": "풀럼",
    "AFC Bournemouth": "본머스",
    "Luton Town FC": "루턴 타운",
    "Burnley FC": "번리",
    "Sheffield United FC": "셰필드 유나이티드",

    // 라리가
    "Real Madrid CF": "레알 마드리드",
    "FC Barcelona": "바르셀로나",
    "Girona FC": "지로나",
    "Club Atlético de Madrid": "아틀레티코 마드리드",
    "Athletic Club": "아틀레틱 빌바오",
    "Real Sociedad de Fútbol": "레알 소시에다드",
    "Real Betis Balompié": "레알 베티스",
    "Villarreal CF": "비야레알",
    "Valencia CF": "발렌시아",
    "Getafe CF": "헤타페",
    "Deportivo Alavés": "알라베스",
    "Sevilla FC": "세비야",
    "RCD Mallorca": "마요르카",
    "CA Osasuna": "오사수나",
    "Rayo Vallecano de Madrid": "라요 바예카노",
    "UD Las Palmas": "라스팔마스",
    "RC Celta de Vigo": "셀타 비고",
    "Cádiz CF": "카디스",
    "Granada CF": "그라나다",
    "UD Almería": "알메리아",
    "RCD Espanyol de Barcelona": "에스파뇰",

    // 세리에 A
    "FC Internazionale Milano": "인터 밀란",
    "AC Milan": "AC 밀란",
    "SSC Napoli": "나폴리",
    "Juventus FC": "유벤투스",
    "Atalanta BC": "아탈란타",
    "AS Roma": "AS 로마",
    "SS Lazio": "라치오",
    "ACF Fiorentina": "피오렌티나",
    "Bologna FC 1909": "볼로냐",
    "Torino FC": "토리노",
    "AC Monza": "몬자",
    "Genoa CFC": "제노아",
    "Hellas Verona FC": "베로나",
    "US Lecce": "레체",
    "Cagliari Calcio": "칼리아리",
    "Udinese Calcio": "우디네세",
    "Empoli FC": "엠폴리",
    "Frosinone Calcio": "프로시노네",
    "US Sassuolo Calcio": "사수올로",
    "US Salernitana 1919": "살레르니타나",
    "Holstein Kiel": "홀슈타인 킬",

    // 분데스리가
    "Bayer 04 Leverkusen": "레버쿠젠",
    "FC Bayern München": "바이에른 뮌헨",
    "VfB Stuttgart": "슈투트가르트",
    "RB Leipzig": "RB 라이프치히",
    "Borussia Dortmund": "도르트문트",
    "Eintracht Frankfurt": "프랑크푸르트",
    "TSG 1899 Hoffenheim": "호펜하임",
    "SC Freiburg": "프라이부르크",
    "FC Augsburg": "아우크스부르크",
    "SV Werder Bremen": "베르더 브레멘",
    "1. FC Heidenheim 1846": "하이덴하임",
    "VfL Wolfsburg": "볼프스부르크",
    "Borussia Mönchengladbach": "묀헨글라트바흐",
    "1. FC Union Berlin": "우니온 베를린",
    "1. FSV Mainz 05": "마인츠",
    "VfL Bochum 1848": "보훔",
    "1. FC Köln": "쾰른",
    "SV Darmstadt 98": "다름슈타트",

    // 리그 1
    "Paris Saint-Germain FC": "파리 생제르맹",
    "AS Monaco FC": "모나코",
    "Stade Brestois 29": "브레스트",
    "Lille OSC": "LOSC 릴",
    "OGC Nice": "니스",
    "RC Lens": "랑스",
    "Olympique Lyonnais": "리옹",
    "Olympique de Marseille": "마르세유",
    "Stade Rennais FC 1901": "렌",
    "Stade de Reims": "랭스",
    "RC Strasbourg Alsace": "스트라스부르",
    "Toulouse FC": "툴루즈",
    "Montpellier HSC": "몽펠리에",
    "FC Nantes": "낭트",
    "FC Lorient": "로리앙",
    "Le Havre AC": "르아브르",
    "FC Metz": "메스",
    "Clermont Foot 63": "클레르몽",
    "AS Saint-Étienne": "생테티엔",
    "AJ Auxerre": "오세르",
    "Angers SCO": "앙제",

    // 챔피언스리그 추가 팀
    "Celtic FC": "셀틱",
    "Sport Lisboa e Benfica": "벤피카",
    "Feyenoord Rotterdam": "페예노르트",
    "Club Brugge KV": "클럽 브뤼헤",
    "FK Shakhtar Donetsk": "샤흐타르 도네츠크",
    "FK Crvena Zvezda": "츠르베나 즈베즈다",
    "SK Sturm Graz": "슈투름 그라츠",
    "AC Sparta Praha": "스파르타 프라하",
    "FC Red Bull Salzburg": "레드불 잘츠부르크",
    "ŠK Slovan Bratislava": "슬로반 브라티슬라바",
    "BSC Young Boys": "영 보이스",
    "PSV Eindhoven": "PSV 에인트호번",
    "GNK Dinamo Zagreb": "디나모 자그레브",
    "Sporting Clube de Portugal": "스포르팅",
  };

  // 매핑된 이름이 있으면 반환, 없으면 원래 이름 반환
  return teamNameMap[name] || name;
}

/**
 * 직관적인 팀 이름 목록 업데이트를 위한 유틸리티 함수
 * @param leagueId 리그 ID
 * @param englishName 영어 팀 이름
 * @param koreanName 한글 팀 이름
 */
export function addTeamNameTranslation(
  leagueId: number,
  englishName: string,
  koreanName: string
): void {
  const leagueKey = leagueId.toString();

  if (!teamNamesByLeague[leagueKey]) {
    teamNamesByLeague[leagueKey] = {};
  }

  teamNamesByLeague[leagueKey][englishName] = koreanName;
}

/**
 * 팀 이름 번역 삭제
 * @param leagueId 리그 ID
 * @param englishName 영어 팀 이름
 */
export function removeTeamNameTranslation(
  leagueId: number,
  englishName: string
): void {
  const leagueKey = leagueId.toString();

  if (
    teamNamesByLeague[leagueKey] &&
    teamNamesByLeague[leagueKey][englishName]
  ) {
    delete teamNamesByLeague[leagueKey][englishName];
  }
}
