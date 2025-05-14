"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Info } from "lucide-react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { LeagueSkeleton } from "@/components/league-skeleton";
import { useLeagueStandings } from "@/lib/footballDataService";
import { translateTeamName } from "@/lib/teamNames";

// football-data.org API 응답 타입 정의
type Team = {
  id: number;
  name: string;
  logo: string; // crest in football-data.org API
};

type Goals = {
  for: number; // goalsFor in football-data.org API
  against: number; // goalsAgainst in football-data.org API
};

type AllStats = {
  played: number; // playedGames in football-data.org API
  win: number; // won in football-data.org API
  draw: number;
  lose: number; // lost in football-data.org API
  goals: Goals;
};

type Standing = {
  rank: number; // position in football-data.org API
  team: Team;
  points: number;
  goalsDiff: number; // goalDifference in football-data.org API
  group: string;
  form: string;
  status: string;
  description: string;
  all: AllStats;
  home: AllStats;
  away: AllStats;
  update: string;
};

type League = {
  id: number;
  name: string;
  country: string;
  logo: string; // emblem in football-data.org API
  flag: string;
  season: number;
};

type SortDirection = "asc" | "desc";
type SortField =
  | "rank"
  | "points"
  | "win"
  | "draw"
  | "lose"
  | "played"
  | "goalsFor"
  | "goalsAgainst"
  | "goalsDiff"
  | "teamName";

// 리그별 유럽대회 진출 및 강등 기준
const leagueQualificationRules: Record<
  string,
  {
    name: string;
    positions: number[];
    color: string;
    description: string;
    bonusSpot?: boolean; // 보너스 출전권 여부
  }[]
> = {
  "2021": [
    // 프리미어 리그
    {
      name: "champions-league",
      positions: [1, 2, 3, 4],
      color: "bg-blue-600/20",
      description: "UEFA 챔피언스리그 진출",
    },
    {
      name: "champions-league-bonus",
      positions: [5],
      color: "bg-blue-400/20",
      description: "UEFA 챔피언스리그 진출 (보너스 출전권)",
      bonusSpot: true,
    },
    {
      name: "europa-league",
      positions: [6],
      color: "bg-orange-500/20",
      description: "UEFA 유로파리그 진출",
    },
    {
      name: "conference-league",
      positions: [7],
      color: "bg-green-600/20",
      description: "UEFA 컨퍼런스리그 진출",
    },
    {
      name: "relegation",
      positions: [18, 19, 20],
      color: "bg-red-600/20",
      description: "강등",
    },
  ],
  "2014": [
    // 라리가
    {
      name: "champions-league",
      positions: [1, 2, 3, 4],
      color: "bg-blue-600/20",
      description: "UEFA 챔피언스리그 진출",
    },
    {
      name: "champions-league-bonus",
      positions: [5],
      color: "bg-blue-400/20",
      description: "UEFA 챔피언스리그 진출 (보너스 출전권)",
      bonusSpot: true,
    },
    {
      name: "europa-league",
      positions: [6, 7],
      color: "bg-orange-500/20",
      description: "UEFA 유로파리그 진출",
    },
    {
      name: "relegation",
      positions: [18, 19, 20],
      color: "bg-red-600/20",
      description: "강등",
    },
  ],
  "2019": [
    // 세리에 A
    {
      name: "champions-league",
      positions: [1, 2, 3, 4],
      color: "bg-blue-600/20",
      description: "UEFA 챔피언스리그 진출",
    },
    {
      name: "champions-league-bonus",
      positions: [5],
      color: "bg-blue-400/20",
      description: "UEFA 챔피언스리그 진출 (보너스 출전권)",
      bonusSpot: true,
    },
    {
      name: "europa-league",
      positions: [6, 7],
      color: "bg-orange-500/20",
      description: "UEFA 유로파리그 진출",
    },
    {
      name: "conference-league",
      positions: [8],
      color: "bg-green-600/20",
      description: "UEFA 컨퍼런스리그 진출",
    },
    {
      name: "relegation",
      positions: [18, 19, 20],
      color: "bg-red-600/20",
      description: "강등",
    },
  ],
  "2002": [
    // 분데스리가
    {
      name: "champions-league",
      positions: [1, 2, 3, 4],
      color: "bg-blue-600/20",
      description: "UEFA 챔피언스리그 진출",
    },
    {
      name: "champions-league-bonus",
      positions: [5],
      color: "bg-blue-400/20",
      description: "UEFA 챔피언스리그 진출 (보너스 출전권)",
      bonusSpot: true,
    },
    {
      name: "europa-league",
      positions: [6, 7],
      color: "bg-orange-500/20",
      description: "UEFA 유로파리그 진출",
    },
    {
      name: "relegation-playoff",
      positions: [16],
      color: "bg-yellow-500/20",
      description: "강등 플레이오프",
    },
    {
      name: "relegation",
      positions: [17, 18],
      color: "bg-red-600/20",
      description: "강등",
    },
  ],
  "2015": [
    // 리그 1
    {
      name: "champions-league",
      positions: [1, 2, 3],
      color: "bg-blue-600/20",
      description: "UEFA 챔피언스리그 진출",
    },
    {
      name: "champions-league-qual",
      positions: [4],
      color: "bg-blue-400/20",
      description: "UEFA 챔피언스리그 예선 진출",
    },
    {
      name: "europa-league",
      positions: [5],
      color: "bg-orange-500/20",
      description: "UEFA 유로파리그 진출",
    },
    {
      name: "relegation-playoff",
      positions: [16],
      color: "bg-yellow-500/20",
      description: "강등 플레이오프",
    },
    {
      name: "relegation",
      positions: [17, 18],
      color: "bg-red-600/20",
      description: "강등",
    },
  ],
  "2001": [
    // 챔피언스리그
    {
      name: "round-of-16",
      positions: [1, 2],
      color: "bg-blue-600/20",
      description: "16강 진출",
    },
    {
      name: "europa-league-playoff",
      positions: [3],
      color: "bg-orange-500/20",
      description: "유로파리그 플레이오프 진출",
    },
    {
      name: "eliminated",
      positions: [4],
      color: "bg-red-600/20",
      description: "탈락",
    },
  ],
};

interface FootballDataStandingsProps {
  leagueId: number;
  season: number;
  showDetail?: boolean;
  onCacheStatusChange?: (isUsingCache: boolean) => void;
}

export function FootballDataStandings({
  leagueId,
  season,
  showDetail = true,
  onCacheStatusChange,
}: FootballDataStandingsProps) {
  // 정렬 상태
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  // 보너스 출전권 표시 여부
  const [showBonusSpots, setShowBonusSpots] = useState<boolean>(true);
  // 처리된 순위 데이터 상태
  const [processedStandings, setProcessedStandings] = useState<Standing[]>([]);

  // TanStack Query 사용
  const { data, isLoading, isError, error } = useLeagueStandings(
    leagueId,
    season,
    { useFirebase: true }
  );

  // 데이터 로깅 및 처리
  useEffect(() => {
    if (data) {
      // standings 데이터 처리
      let standingsArray: Standing[] = [];
      // API 응답에서 standings 데이터 추출
      if (data.standings && Array.isArray(data.standings)) {
        standingsArray = data.standings;
      }
      setProcessedStandings(standingsArray);
    } else {
      setProcessedStandings([]);
    }
  }, [data, leagueId]);

  // 캐시 상태 변경 감지
  useEffect(() => {
    if (data?.isUsingFirebase && onCacheStatusChange) {
      onCacheStatusChange(data.isUsingFirebase);
    }
  }, [data, onCacheStatusChange]);

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "rank" ? "asc" : "desc");
    }
  };

  // 정렬된 데이터 계산
  const sortedData =
    processedStandings.length > 0
      ? [...processedStandings].sort((a, b) => {
          let aValue: any, bValue: any;

          // field에 따라 적절한 값 가져오기
          switch (sortField) {
            case "rank":
              aValue = a.rank;
              bValue = b.rank;
              break;
            case "points":
              aValue = a.points;
              bValue = b.points;
              break;
            case "win":
              aValue = a.all.win;
              bValue = b.all.win;
              break;
            case "draw":
              aValue = a.all.draw;
              bValue = b.all.draw;
              break;
            case "lose":
              aValue = a.all.lose;
              bValue = b.all.lose;
              break;
            case "played":
              aValue = a.all.played;
              bValue = b.all.played;
              break;
            case "goalsFor":
              aValue = a.all.goals.for;
              bValue = b.all.goals.for;
              break;
            case "goalsAgainst":
              aValue = a.all.goals.against;
              bValue = b.all.goals.against;
              break;
            case "goalsDiff":
              aValue = a.goalsDiff;
              bValue = b.goalsDiff;
              break;
            case "teamName":
              aValue = a.team.name.toLowerCase();
              bValue = b.team.name.toLowerCase();
              return sortDirection === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
            default:
              aValue = a.rank;
              bValue = b.rank;
          }

          // 방향에 따른 정렬 (teamName은 이미 위에서 처리됨)
          if (sortField !== ("teamName" as SortField)) {
            if (sortDirection === "asc") {
              return aValue - bValue;
            } else {
              return bValue - aValue;
            }
          }
          return 0;
        })
      : [];

  // 리그별 규정 가져오기
  const qualificationRules =
    leagueQualificationRules[leagueId.toString()] ||
    leagueQualificationRules["2021"];

  // 보너스 출전권 필터링
  const filteredRules = showBonusSpots
    ? qualificationRules
    : qualificationRules.filter((rule) => !rule.bonusSpot);

  // 순위에 따른 색상 및 설명 가져오기
  const getPositionInfo = (position: number) => {
    for (const rule of filteredRules) {
      if (rule.positions.includes(position)) {
        return {
          color: rule.color,
          description: rule.description,
          bonusSpot: rule.bonusSpot || false,
        };
      }
    }
    return { color: "", description: "", bonusSpot: false };
  };

  // 폼(Form) 글자 색상 결정 함수
  function getFormLetterClass(letter: string) {
    switch (letter) {
      case "W":
        return "text-green-600 dark:text-green-400";
      case "D":
        return "text-gray-500 dark:text-gray-400";
      case "L":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-400";
    }
  }
  // 폼 (Form) 한글화
  function getFormLetterKr(letter: string) {
    switch (letter) {
      case "W":
        return "승";
      case "D":
        return "무";
      case "L":
        return "패";
      default:
        return "";
    }
  }

  function renderStandingsTable() {
    if (isError) {
      return (
        <div className="p-4 text-center text-red-500">
          <p>
            {error instanceof Error
              ? error.message
              : "데이터를 불러오는 중 오류가 발생했습니다"}
          </p>
        </div>
      );
    }

    if (isLoading) {
      return <LeagueSkeleton />;
    }

    if (!processedStandings || processedStandings.length === 0) {
      return (
        <div className="p-4 text-center">
          <p>현재 순위 데이터가 없습니다.</p>
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Badge
              variant={showBonusSpots ? "default" : "outline"}
              className="cursor-pointer mr-2"
              onClick={() => setShowBonusSpots(!showBonusSpots)}
            >
              2024-25 보너스 출전권 {showBonusSpots ? "표시" : "숨김"}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    2024-25 시즌부터 UEFA 챔피언스리그는 리그 성적에 따라 보너스
                    출전권이 부여됩니다. 이에 따라 일부 리그는 기존보다 더 많은
                    팀이 챔피언스리그에 진출할 수 있습니다.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="border rounded-md overflow-x-auto max-w-[1000px] mx-auto">
          <Table className="min-w-[800px] w-full">
            <TableHeader>
              <TableRow>
                <TableHead
                  className="w-[60px] text-center cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("rank")}
                >
                  <div className="flex items-center justify-center">
                    순위
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </div>
                </TableHead>
                <TableHead
                  className="min-w-[180px] cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("teamName")}
                >
                  <div className="flex items-center">
                    팀
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </div>
                </TableHead>
                <TableHead
                  className="w-[60px] text-center cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("points")}
                >
                  <div className="flex items-center justify-center">
                    <span className="text-blue-600 font-bold">승점</span>
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </div>
                </TableHead>
                <TableHead
                  className="w-[60px] text-center cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("played")}
                >
                  <div className="flex items-center justify-center">
                    경기
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </div>
                </TableHead>
                <TableHead
                  className="w-[50px] text-center cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("win")}
                >
                  <div className="flex items-center justify-center">
                    승
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </div>
                </TableHead>
                <TableHead
                  className="w-[50px] text-center cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("draw")}
                >
                  <div className="flex items-center justify-center">
                    무
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </div>
                </TableHead>
                <TableHead
                  className="w-[50px] text-center cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("lose")}
                >
                  <div className="flex items-center justify-center">
                    패
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </div>
                </TableHead>
                <TableHead
                  className="w-[50px] text-center cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("goalsFor")}
                >
                  <div className="flex items-center justify-center">
                    득
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </div>
                </TableHead>
                <TableHead
                  className="w-[50px] text-center cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("goalsAgainst")}
                >
                  <div className="flex items-center justify-center">
                    실
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </div>
                </TableHead>
                <TableHead
                  className="w-[60px] text-center cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("goalsDiff")}
                >
                  <div className="flex items-center justify-center">
                    득실
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </div>
                </TableHead>
                {showDetail && (
                  <TableHead className="w-[100px] text-center whitespace-nowrap">
                    최근 5경기
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((standing) => {
                const positionInfo = getPositionInfo(standing.rank);
                return (
                  <TableRow
                    key={standing.team.id}
                    className={positionInfo.color}
                  >
                    <TableCell className="text-center font-medium">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center justify-center w-full">
                            {standing.rank}
                            {positionInfo.bonusSpot && (
                              <span className="ml-1 text-xs text-blue-500">
                                *
                              </span>
                            )}
                          </TooltipTrigger>
                          {positionInfo.description && (
                            <TooltipContent side="right">
                              <p>{positionInfo.description}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 w-5 h-5 relative">
                          <Image
                            src={standing.team.logo}
                            alt={standing.team.name}
                            fill
                            sizes="20px"
                            className="object-contain"
                          />
                        </div>
                        <span>
                          {translateTeamName(standing.team.name, leagueId)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-blue-600">
                      {standing.points}
                    </TableCell>
                    <TableCell className="text-center">
                      {standing.all.played}
                    </TableCell>
                    <TableCell className="text-center font-medium text-green-600 dark:text-green-400">
                      {standing.all.win}
                    </TableCell>
                    <TableCell className="text-center">
                      {standing.all.draw}
                    </TableCell>
                    <TableCell className="text-center font-medium text-red-600 dark:text-red-400">
                      {standing.all.lose}
                    </TableCell>
                    <TableCell className="text-center">
                      {standing.all.goals.for}
                    </TableCell>
                    <TableCell className="text-center">
                      {standing.all.goals.against}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {standing.goalsDiff > 0
                        ? `+${standing.goalsDiff}`
                        : standing.goalsDiff}
                    </TableCell>

                    {showDetail && (
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-0.5">
                          {standing.form
                            ? standing.form
                                .split("")
                                .map((letter: string, index: number) => (
                                  <span
                                    key={index}
                                    className={`text-xs font-bold ${getFormLetterClass(
                                      letter
                                    )}`}
                                  >
                                    {getFormLetterKr(letter)}
                                  </span>
                                ))
                            : "-"}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm">
          <h4 className="font-semibold mb-2">범례:</h4>
          <div className="space-y-1">
            {filteredRules.map((rule, index) => (
              <div
                key={index}
                className={`inline-block mr-2 mb-2 px-2 py-1 rounded ${rule.color}`}
              >
                {rule.description}
                {rule.bonusSpot && (
                  <span className="ml-1 text-xs text-blue-500">*</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {renderStandingsTable()}
      {processedStandings && processedStandings.length > 0 && (
        <p className="text-xs text-gray-500 mt-4 text-right">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center justify-end cursor-help">
                  <Info className="h-3 w-3 mr-1" />
                  데이터 제공: football-data.org
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  이 데이터는 football-data.org API에서 제공됩니다.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
      )}
    </div>
  );
}
