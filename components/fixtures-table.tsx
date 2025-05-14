"use client";

import { useState, useRef, useEffect } from "react";
import { format, parseISO, isSameDay, addDays } from "date-fns";
import { ko } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Calendar, ArrowDown } from "lucide-react";
import { translateTeamName } from "@/lib/teamNames";

interface FixturesTableProps {
  data: {
    fixtures: any[];
    groupedFixtures: Record<string, any[]>;
  };
}

export function FixturesTable({ data }: FixturesTableProps) {
  // 이용 가능한 월 목록 구하기
  const availableMonths = Object.keys(data.groupedFixtures).sort().reverse();

  // 가장 최근 월 찾기 (현재 월에 경기가 없으면 그 이전 월)
  const findMostRecentMonth = () => {
    if (availableMonths.length === 0) return "all";

    const currentDate = new Date();
    const currentYearMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;

    // 현재 월에 경기가 있으면 현재 월 반환
    if (availableMonths.includes(currentYearMonth)) {
      return currentYearMonth;
    }

    // 현재 월에 경기가 없으면 가장 최근 월 반환
    return availableMonths[0]; // 이미 역순 정렬됨
  };

  const [selectedMonth, setSelectedMonth] = useState<string>(
    findMostRecentMonth()
  );

  // 다가오는 경기로 스크롤하기 위한 ref
  const upcomingFixtureRef = useRef<HTMLDivElement>(null);

  // 월 이름 포맷팅
  const formatMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    return `${year}년 ${month}월`;
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "yyyy년 MM월 dd일 (EEE)", { locale: ko });
  };

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "HH:mm", { locale: ko });
  };

  // 경기 상태 표시
  const getStatusText = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "예정";
      case "TIMED":
        return "예정";
      case "IN_PLAY":
        return "진행중";
      case "PAUSED":
        return "중단";
      case "FINISHED":
        return "종료";
      case "SUSPENDED":
        return "연기";
      case "POSTPONED":
        return "연기";
      case "CANCELLED":
        return "취소";
      case "AWARDED":
        return "승리 판정";
      default:
        return status;
    }
  };

  // 경기 상태에 따른 스타일 지정
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "SCHEDULED":
      case "TIMED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "IN_PLAY":
      case "PAUSED":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "FINISHED":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      case "SUSPENDED":
      case "POSTPONED":
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "AWARDED":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // 표시할 데이터 결정
  const fixturesToShow =
    selectedMonth === "all"
      ? data.fixtures
      : data.groupedFixtures[selectedMonth] || [];

  // 경기를 날짜별로 그룹화
  const groupFixturesByDate = (fixtures: any[]) => {
    const grouped: Record<string, any[]> = {};

    fixtures.forEach((fixture) => {
      const date = parseISO(fixture.date);
      const dateStr = format(date, "yyyy-MM-dd");

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }

      grouped[dateStr].push(fixture);
    });

    // 그룹 내에서 시간순으로 정렬
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort(
        (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
      );
    });

    return grouped;
  };

  // 날짜별로 그룹화된 경기
  const groupedByDate = groupFixturesByDate(fixturesToShow);

  // UI 표시용 (내림차순 - 최신순)
  const sortedDatesForDisplay = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // 다가오는 경기 찾기용 (오름차순 - 과거부터 미래순)
  const sortedDatesForUpcoming = Object.keys(groupedByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // 다가오는 경기가 있는 날짜 찾기
  const findUpcomingFixtureDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘이나 미래의 가장 가까운 날짜 찾기 (오름차순이므로 처음 찾은 것이 가장 가까운 것)
    const upcomingDate = sortedDatesForUpcoming.find((dateStr) => {
      const date = new Date(dateStr);
      return date >= today;
    });

    // 미래 날짜가 없으면 가장 최근 과거 날짜 (내림차순의 첫 번째)
    return upcomingDate || sortedDatesForDisplay[0];
  };

  // 다가오는 경기로 스크롤하는 함수
  const scrollToUpcomingFixture = () => {
    if (upcomingFixtureRef.current) {
      upcomingFixtureRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 다가오는 경기가 있는 날짜
  const upcomingFixtureDate = findUpcomingFixtureDate();

  if (!data || !data.fixtures || data.fixtures.length === 0) {
    return (
      <div className="text-center py-8">
        <p>경기 일정 데이터가 없습니다.</p>
      </div>
    );
  }

  useEffect(() => {
    scrollToUpcomingFixture();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-48">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="월 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 보기</SelectItem>
              {availableMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {formatMonthName(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedMonth !== "all" && (
          <div className="text-base font-medium">
            {formatMonthName(selectedMonth)} ({fixturesToShow.length}경기)
          </div>
        )}

        <div className="flex-1"></div>

        <Button
          variant="outline"
          size="sm"
          onClick={scrollToUpcomingFixture}
          className="flex items-center gap-1"
        >
          <Calendar className="h-4 w-4" />
          다가오는 경기로
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-8">
        {sortedDatesForDisplay.map((dateStr, index) => {
          const isUpcomingDate = dateStr === upcomingFixtureDate;
          const dateRef = isUpcomingDate ? upcomingFixtureRef : null;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const fixtureDate = new Date(dateStr);

          // 오늘, 내일, 어제 표시
          let dateLabel = "";
          if (isSameDay(fixtureDate, today)) {
            dateLabel = " (오늘)";
          } else if (isSameDay(fixtureDate, addDays(today, 1))) {
            dateLabel = " (내일)";
          } else if (isSameDay(fixtureDate, addDays(today, -1))) {
            dateLabel = " (어제)";
          }

          return (
            <div
              key={dateStr}
              ref={dateRef}
              className={`pb-4 ${isUpcomingDate ? "scroll-mt-20" : ""}`}
            >
              <h3
                className={`text-lg font-bold mb-4 pb-2 border-b ${
                  isUpcomingDate ? "text-blue-600 dark:text-blue-400" : ""
                }`}
              >
                {formatDate(dateStr + "T00:00:00")}
                {dateLabel}
                {isUpcomingDate && (
                  <Badge className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    다가오는 경기
                  </Badge>
                )}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedByDate[dateStr].map((fixture) => (
                  <Card key={fixture.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="text-sm">
                              {formatTime(fixture.date)}
                            </span>
                          </div>
                          <Badge
                            className={`${getStatusStyle(fixture.status)}`}
                          >
                            {getStatusText(fixture.status)}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between py-3 border-t border-b">
                          <div className="flex items-center flex-1">
                            <div className="relative w-8 h-8 mr-3">
                              <img
                                src={fixture.homeTeamLogo || "/placeholder.svg"}
                                alt={`${fixture.homeTeam} 로고`}
                                className="object-contain w-full h-full"
                              />
                            </div>
                            <span className="font-medium">
                              {translateTeamName(fixture.homeTeam)}
                            </span>
                          </div>

                          <div className="px-3 py-1 font-bold text-lg">
                            {fixture.status === "FINISHED" ||
                            fixture.status === "IN_PLAY" ||
                            fixture.status === "PAUSED"
                              ? `${fixture.score.home ?? "-"} : ${
                                  fixture.score.away ?? "-"
                                }`
                              : "vs"}
                          </div>

                          <div className="flex items-center justify-end flex-1">
                            <span className="font-medium">
                              {translateTeamName(fixture.awayTeam)}
                            </span>
                            <div className="relative w-8 h-8 ml-3">
                              <img
                                src={fixture.awayTeamLogo || "/placeholder.svg"}
                                alt={`${fixture.awayTeam} 로고`}
                                className="object-contain w-full h-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
