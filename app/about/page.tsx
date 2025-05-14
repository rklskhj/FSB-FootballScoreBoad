import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          홈으로 돌아가기
        </Link>
        <ThemeToggle />
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About</h1>

        <div className="prose dark:prose-invert max-w-none">
          <p>
            이 웹사이트는 유럽 5대 리그(프리미어리그, 라리가, 세리에 A, 분데스리가, 리그 1)의 축구 데이터를 제공하는
            교육 목적의 비상업적 프로젝트입니다.
          </p>

          <h2>데이터 출처</h2>
          <p>
            이 웹사이트에서 사용되는 모든 팀 로고와 데이터는 API-Football에서 제공받았으며, 비상업적, 교육적 목적으로만
            사용됩니다.
          </p>

          <blockquote>
            Team logos are provided by API-Football and used for non-commercial, educational purposes only.
          </blockquote>

          <h2>기술 스택</h2>
          <ul>
            <li>Next.js - React 프레임워크</li>
            <li>Tailwind CSS - 스타일링</li>
            <li>shadcn/ui - UI 컴포넌트</li>
          </ul>

          <h2>기능</h2>
          <ul>
            <li>리그별 순위표 확인</li>
            <li>득점 및 어시스트 순위 확인</li>
            <li>경기 일정 및 결과 확인</li>
            <li>경기 상세 정보 확인</li>
            <li>다크 모드 지원</li>
          </ul>

          <p>이 프로젝트는 계속해서 개발 중이며, 새로운 기능이 추가될 예정입니다.</p>
        </div>
      </div>
    </div>
  )
}
