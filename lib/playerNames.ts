// 선수 이름 영어→한글 매핑 정보 (리그 구분 없이 단일 객체)
const playerNameMap: Map<string, string> = new Map([
  // Premier League
  ["Mohamed Salah", "모하메드 살라"],
  ["Alexander Isak", "알렉산더 이삭"],
  ["Erling Haaland", "엘링 홀란"],
  ["Chris Wood", "크리스 우드"],
  ["Bryan Mbeumo", "브라이언 음베우모"],
  ["Yoane Wissa", "요안 위사"],
  ["Ollie Watkins", "올리 왓킨스"],
  ["Cole Palmer", "콜 팔머"],
  ["Matheus Cunha", "마테우스 쿠냐"],
  ["Jean-Philippe Mateta", "장필리프 마테타"],
  ["Jørgen Strand Larsen", "요르겐 스트란 라르센"],
  ["Justin Kluivert", "저스틴 클뤼베르트"],
  ["Liam Delap", "리암 델랍"],
  ["Luis Díaz", "루이스 디아스"],
  ["Kevin Schade", "케빈 샤더"],
  ["Brennan Johnson", "브레넌 존슨"],
  ["Raúl Jiménez", "라울 히메네스"],
  ["Jarrod Bowen", "자로드 보웬"],
  ["João Pedro", "조아오 페드로"],
  ["Danny Welbeck", "대니 웰벡"],
  ["Bukayo Saka", "부카요 사카"],

  // La Liga
  ["Kylian Mbappé", "킬리안 음바페"],
  ["Robert Lewandowski", "로베르트 레반도프스키"],
  ["Ante Budimir", "안테 부디미르"],
  ["Alexander Sørloth", "알렉산더 설로트"],
  ["Raphinha", "하피냐"],
  ["Ayoze Pérez", "아요제 페레즈"],
  ["Julián Álvarez", "훌리안 알바레즈"],
  ["Oihan Sancet", "오이한 산세트"],
  ["Kike García", "키케 가르시아"],
  ["Javi Puado", "하비 푸아도"],
  ["Vinicius Junior", "비니시우스 주니오르"],
  ["Thierno Barry", "티에르노 바리"],
  ["Dodi Lukebakio", "도디 루케바키오"],
  ["Hugo Duro", "우고 두로"],
  ["Fábio Silva", "파비오 실바"],
  ["Ferrán Torres", "페란 토레스"],
  ["Borja Iglesias", "보르하 이글레시아스"],
  ["Dani Olmo", "다니 올모"],
  ["Sandro", "산드로"],
  ["Iago Aspas", "이아고 아스파스"],
  ["Antoine Griezmann", "안토니 그리즈만"],
  ["Lamine Yamal", "라민 야말"],

  // Serie A
  ["Mateo Retegui", "마테오 레테기"],
  ["Moise Kean", "모이제 킨"],
  ["Ademola Lookman", "아데몰라 루크만"],
  ["Marcus Thuram-Ulien", "마르쿠스 투람-울리엔"],
  ["Riccardo Orsolini", "리카르도 오르솔리니"],
  ["Lautaro Martínez", "라우타로 마르티네스"],
  ["Artem Dovbyk", "아르템 도브빅"],
  ["Romelu Lukaku", "로멜루 루카쿠"],
  ["Scott McTominay", "스콧 맥토미니"],
  ["Nikola Krstović", "니콜라 크르스토비치"],
  ["Lorenzo Lucca", "로렌조 루카"],
  ["Christian Pulisic", "크리스찬 풀리식"],
  ["Tijjani Reijnders", "티야니 레인더스"],
  ["Valentín Castellanos", "발렌틴 카스테야노스"],
  ["Boulaye Dia", "불라예 디아"],
  ["Dušan Vlahović", "두샨 블라호비치"],
  ["Roberto Piccoli", "로베르토 피콜리"],
  ["Che Adams", "체 아담스"],
  ["Florian Thauvin", "플로리안 토방"],
  ["Mattia Zaccagni", "마티아 자카니"],

  // Bundesliga
  ["Harry Kane", "해리 케인"],
  ["Patrik Schick", "파트릭 시크"],
  ["Sehrou Guirassy", "세루 기라시"],
  ["Jonathan Burkardt", "요나탄 부르카르트"],
  ["Tim Kleindienst", "팀 클라인디엔스트"],
  ["Omar Marmoush", "오마르 마르무시"],
  ["Hugo Ekitike", "위고 에키티케"],
  ["Benjamin Šeško", "벤야민 셰슈코"],
  ["Ermedin Demirovic", "에르메딘 데미로비치"],
  ["Jamal Musiala", "자말 무시알라"],
  ["Leroy Sané", "레로이 자네"],
  ["Michael Olise", "마이클 올리세"],
  ["Alassane Pléa", "알라산 플레아"],
  ["Shuto Machino", "마치노 슈토"],
  ["Andrej Kramarić", "안드레이 크라마리치"],
  ["Nick Woltemade", "닉 볼테마데"],
  ["Mohammed Amoura", "모하메드 아무라"],
  ["Florian Wirtz", "플로리안 비르츠"],
  ["Benedict Hollerbach", "베네딕트 홀러바흐"],
  ["Ritsu Doan", "도안 리쓰"],

  // Ligue 1
  ["Ousmane Dembélé", "우스만 뎀벨레"],
  ["Mason Greenwood", "메이슨 그린우드"],
  ["Arnaud Kalimuendo", "아르노 칼리뮈엔도"],
  ["Jonathan David", "조나단 데이비드"],
  ["Emanuel Emegha", "에마누엘 에메가"],
  ["Bradley Barcola", "브래들리 바르콜라"],
  ["Mika Biereth", "미카 비어레트"],
  ["Alexandre Lacazette", "알렉상드르 라카제트"],
  ["Ludovic Ajorque", "뤼도빅 아조르크"],
  ["Amine Gouiri", "아민 구이리"],
  ["Lucas Stassin", "뤼카 스타생"],
  ["Georges Mikautadze", "조르주 미카우타제"],
  ["Keito Nakamura", "나카무라 케이토"],
  ["Evann Guessand", "에반 게상"],
  ["Gonçalo Ramos", "곤살로 라모스"],
  ["Hamed Traoré", "아메드 트라오레"],
  ["Gaëtan Perrin", "가에탄 페랑"],
  ["Gaëtan Laborde", "가에탄 라보르드"],
  ["Zuriko Davitashvili", "주리코 다비타슈빌리"],
  ["Andrey Santos", "안드레이 산토스"],

  // Champions League
  ["Vangelis Pavlidis", "반겔리스 파비디스"],
  ["Santiago Giménez", "산티아고 히히메네스"],
  ["Viktor Gyökeres", "빅토르 요케레스"],
  ["Karim Adeyemi", "카림 아데예미"],
]);

/**
 * 선수 이름을 한글로 변환하는 함수 (리그 구분 없음)
 * @param englishName 영어 선수 이름
 * @returns 한글 선수 이름 (번역이 없을 경우 원래 이름)
 */
export function translatePlayerName(englishName: string): string {
  return playerNameMap.get(englishName) || englishName;
}

/**
 * 선수 이름 번역 추가
 * @param englishName 영어 선수 이름
 * @param koreanName 한글 선수 이름
 */
export function addPlayerNameTranslation(
  englishName: string,
  koreanName: string
): void {
  playerNameMap.set(englishName, koreanName);
}

/**
 * 선수 이름 번역 삭제
 * @param englishName 영어 선수 이름
 */
export function removePlayerNameTranslation(englishName: string): void {
  playerNameMap.delete(englishName);
}
