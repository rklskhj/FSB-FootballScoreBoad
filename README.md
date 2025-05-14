# 유럽 축구 리그 정보 웹 애플리케이션

Next.js 13 App Router와 React를 사용한 유럽 5대 리그 정보 웹 애플리케이션입니다.

## 주요 기능

- 유럽 5대 리그(프리미어 리그, 라 리가, 분데스리가, 세리에 A, 리그 앙) 순위 및 결과 제공
- football-data.org API를 활용한 실시간 데이터 제공
- 반응형 디자인으로 모바일, 태블릿, 데스크탑에서 모두 사용 가능
- 다크 모드 지원
- Firebase를 통한 데이터 캐싱 및 관리

## 설치 및 실행

### 사전 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn 또는 pnpm

### 설치 방법

1. 저장소 클론

```bash
git clone https://github.com/yourusername/football-leagues.git
cd football-leagues
```

2. 종속성 설치

```bash
npm install
# 또는 yarn install
# 또는 pnpm install
```

3. football-data.org API 키 설정

- [football-data.org](https://www.football-data.org/)에 가입하고 API 키 발급
- 프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용 추가:

```
FOOTBALL_DATA_API_KEY=your_api_key_here
FOOTBALL_DATA_BASE_URL=https://api.football-data.org/v4
```

> **참고**: football-data.org의 무료 플랜으로도 다양한 데이터에 접근할 수 있지만, 일부 제한이 있을 수 있습니다. 상세 정보는 [공식 문서](https://www.football-data.org/documentation)를 참조하세요.

### 개발 서버 실행

```bash
npm run dev
# 또는 yarn dev
# 또는 pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 결과 확인

### 프로덕션 빌드

```bash
npm run build
npm start
# 또는 yarn build && yarn start
# 또는 pnpm build && pnpm start
```

## 기술 스택

- [Next.js 13 (App Router)](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Firebase](https://firebase.google.com/)

## 폴더 구조

```
football-leagues/
├── app/                # Next.js 13 App Router 페이지
├── components/         # 재사용 가능한 컴포넌트
├── lib/                # 유틸리티 함수 및 API 관련 코드
├── public/             # 정적 파일 (이미지, 아이콘 등)
├── styles/             # 글로벌 스타일
└── types/              # TypeScript 타입 정의
```

## football-data.org API 사용 관련 참고사항

football-data.org API는 다음과 같은 플랜 제한 사항이 있을 수 있습니다:

1. 무료 티어:

   - 일일 요청 수 제한
   - 일부 엔드포인트 접근 제한
   - 최신 데이터 딜레이 가능성

2. 유료 플랜:
   - 더 많은 요청 수
   - 모든 엔드포인트 접근 가능
   - 최신 데이터 실시간 업데이트

현재 시즌 데이터가 필요하시면 football-data.org의 API 문서를 확인하여 적절한 엔드포인트를 사용하세요.

## 사용된 API

- [football-data.org API](https://www.football-data.org/documentation)

## 기여 방법

1. 이 저장소를 포크합니다.
2. 새 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다.

## 라이선스

MIT 라이선스에 따라 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 저작권 고지

팀 로고 및 리그 데이터는 football-data.org에서 제공되며, 비상업적, 교육적 목적으로만 사용됩니다.
