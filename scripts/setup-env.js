const fs = require("fs");
const path = require("path");
const readline = require("readline");

// .env.local 템플릿
const ENV_TEMPLATE = `# football-data.org API 설정
# https://www.football-data.org/에서 API 키를 얻으세요
FOOTBALL_DATA_API_KEY=your_api_key_here
FOOTBALL_DATA_BASE_URL=https://api.football-data.org/v4

# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# 데이터 업데이트를 위한 시크릿 키 (자동 업데이트 설정 시 사용)
UPDATE_SECRET_KEY=your_update_secret
`;

// .env.local 파일 경로
const envPath = path.join(process.cwd(), ".env.local");

// 대화형 인터페이스 생성
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 파일 존재 여부 확인
if (fs.existsSync(envPath)) {
  rl.question(
    ".env.local 파일이 이미 존재합니다. 덮어쓰시겠습니까? (y/n): ",
    (answer) => {
      if (answer.toLowerCase() === "y") {
        createEnvFile();
      } else {
        console.log(".env.local 파일 생성을 취소했습니다.");
        rl.close();
      }
    }
  );
} else {
  createEnvFile();
}

// .env.local 파일 생성 함수
function createEnvFile() {
  rl.question(
    "football-data.org API 키를 입력하세요 (없으면 Enter): ",
    (apiKey) => {
      let envContent = ENV_TEMPLATE;

      if (apiKey) {
        envContent = envContent.replace(
          "FOOTBALL_DATA_API_KEY=your_api_key_here",
          `FOOTBALL_DATA_API_KEY=${apiKey}`
        );
        console.log("API 키가 .env.local 파일에 추가되었습니다.");
      } else {
        console.log(
          "API 키가 설정되지 않았습니다. 나중에 .env.local 파일을 수동으로 편집할 수 있습니다."
        );
      }

      try {
        fs.writeFileSync(envPath, envContent);
        console.log(`.env.local 파일이 생성되었습니다: ${envPath}`);
        console.log("애플리케이션을 다시 시작하여 변경 사항을 적용하세요.");
      } catch (error) {
        console.error("파일 생성 중 오류가 발생했습니다:", error);
      }

      rl.close();
    }
  );
}
