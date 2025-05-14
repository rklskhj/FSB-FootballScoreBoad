import * as admin from "firebase-admin";

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  try {
    // 환경 변수가 설정되어 있는지 확인
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      // 환경 변수가 있으면 서비스 계정으로 초기화
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
      console.log("Firebase Admin SDK initialized with service account");
    } else {
      // 환경 변수가 없으면 기본 앱으로 초기화 (개발 환경용)
      admin.initializeApp({
        projectId: "demo-project",
      });
      console.log(
        "Firebase Admin SDK initialized with default app (development mode)"
      );
    }
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

// Firestore 데이터베이스 인스턴스 내보내기
export const adminDb = admin.apps.length ? admin.firestore() : null;
