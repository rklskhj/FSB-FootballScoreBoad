// Firebase 설정
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Firebase 구성 (실제 프로젝트에서는 .env.local 파일에 저장해야 합니다)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 클라이언트 사이드에서만 오프라인 지원 활성화
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      // 여러 탭이 열려 있는 경우 발생할 수 있음
      console.log(
        "오프라인 지원을 위한 인덱스드 DB 지속성을 활성화할 수 없습니다: 여러 탭이 열려있습니다."
      );
    } else if (err.code === "unimplemented") {
      // 브라우저가 IndexedDB를 지원하지 않는 경우
      console.log(
        "현재 브라우저는 오프라인 지원을 위한 인덱스드 DB를 지원하지 않습니다."
      );
    }
  });
}

export { db };
