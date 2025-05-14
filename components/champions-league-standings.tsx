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

import { LeagueSkeleton } from "@/components/league-skeleton";
import { translateTeamName } from "@/lib/teamNames";
import { translatePlayerName } from "@/lib/playerNames";

type Team = {
  id: number;
  name: string;
  crest: string;
};

type Standing = {
  position: number;
  team: Team;
  playedGames: number;
  form: string;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

type StandingGroup = {
  group: string;
  table: Standing[];
};

type SortDirection = "asc" | "desc";
type SortField =
  | "position"
  | "points"
  | "won"
  | "draw"
  | "lost"
  | "playedGames"
  | "goalsFor"
  | "goalsAgainst"
  | "goalDifference"
  | "teamName";

interface ChampionsLeagueStandingsProps {
  onCacheStatusChange?: (isUsingCache: boolean) => void;
}

export function ChampionsLeagueStandings({
  onCacheStatusChange,
}: ChampionsLeagueStandingsProps) {
  const [standings, setStandings] = useState<StandingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("position");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [error, setError] = useState<string | null>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [scorers, setScorers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 모든 데이터를 한 번에 가져오기
        const response = await fetch(
          "/api/champions-league?type=all&useFirebase=true"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Champions League data");
        }

        const data = await response.json();

        if (data.standings) {
          setStandings(data.standings);
          // onCacheStatusChange 호출을 여기서 직접 하지 않고, 상태를 저장
          const isCache = data.isCache || false;
          // 상태 저장 후 useEffect에서 처리
          if (onCacheStatusChange) {
            onCacheStatusChange(isCache);
          }
        } else {
          throw new Error("Invalid standings data format");
        }

        if (data.matches) {
          // 유효한 날짜 형식인지 확인하는 함수
          const isValidDate = (dateStr: string) => {
            try {
              const timestamp = Date.parse(dateStr);
              return !isNaN(timestamp);
            } catch (e) {
              return false;
            }
          };

          // 유효한 경기 데이터만 필터링
          const validMatches = data.matches.filter(
            (match: any) =>
              match &&
              typeof match === "object" &&
              match.date &&
              isValidDate(match.date) &&
              match.homeTeam &&
              match.awayTeam &&
              match.score
          );

          const finished = validMatches
            .filter((match: any) => match.status === "FINISHED")
            .sort(
              (a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 5);

          const upcoming = validMatches
            .filter((match: any) => match.status === "SCHEDULED")
            .sort(
              (a: any, b: any) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .slice(0, 5);

          setRecentMatches(finished);
          setUpcomingMatches(upcoming);
        }

        if (data.scorers) {
          setScorers(data.scorers.slice(0, 10));
        }
      } catch (err) {
        console.error("Error fetching Champions League data:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [onCacheStatusChange]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // 같은 필드를 다시 클릭하면 정렬 방향 전환
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // 다른 필드 클릭 시 해당 필드로 정렬하고 오름차순 시작
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getPositionInfo = (position: number) => {
    if (position <= 8) {
      return {
        color: "bg-blue-600/20",
        description: "16강 진출",
      };
    } else if (position <= 24) {
      return {
        color: "bg-green-600/20",
        description: "플레이오프 진출",
      };
    } else {
      return {
        color: "bg-red-600/20",
        description: "탈락",
      };
    }
  };

  function getFormLetterClass(letter: string) {
    switch (letter) {
      case "W":
        return "bg-green-600 text-white";
      case "D":
        return "bg-gray-400 text-white";
      case "L":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  }

  function getFormLetterKr(letter: string) {
    switch (letter) {
      case "W":
        return "승";
      case "D":
        return "무";
      case "L":
        return "패";
      default:
        return "-";
    }
  }

  function formatDate(dateString: string) {
    try {
      // 유효한 날짜인지 확인
      const timestamp = Date.parse(dateString);
      if (isNaN(timestamp)) {
        return "날짜 정보 없음";
      }

      const date = new Date(dateString);
      return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("날짜 형식 변환 오류:", error);
      return "날짜 정보 없음";
    }
  }

  if (loading) {
    return <LeagueSkeleton />;
  }

  if (error) {
    return <div className="text-center text-red-500 my-4">{error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* 최근 경기 결과 */}
      {recentMatches.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">최근 경기 결과</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {recentMatches.map((match) => (
              <div
                key={match.id}
                className="border rounded-md p-4 flex flex-col"
              >
                <div className="text-sm text-gray-500 mb-2">
                  {formatDate(match.date)} | {match.venue}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="relative w-8 h-8">
                      <Image
                        src={match.homeTeamLogo}
                        alt={match.homeTeam}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-medium">
                      {translateTeamName(match.homeTeam)}
                    </span>
                  </div>
                  <div className="font-bold text-lg mx-2">
                    {match.score.home} - {match.score.away}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {translateTeamName(match.awayTeam)}
                    </span>
                    <div className="relative w-8 h-8">
                      <Image
                        src={match.awayTeamLogo}
                        alt={match.awayTeam}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  {match.stage.replace("_", " ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 예정된 경기 */}
      {upcomingMatches.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">예정된 경기</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingMatches.map((match) => (
              <div
                key={match.id}
                className="border rounded-md p-4 flex flex-col"
              >
                <div className="text-sm text-gray-500 mb-2">
                  {formatDate(match.date)} | {match.venue}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="relative w-8 h-8">
                      <Image
                        src={match.homeTeamLogo}
                        alt={match.homeTeam}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-medium">
                      {translateTeamName(match.homeTeam)}
                    </span>
                  </div>
                  <div className="font-bold text-lg mx-2">VS</div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {translateTeamName(match.awayTeam)}
                    </span>
                    <div className="relative w-8 h-8">
                      <Image
                        src={match.awayTeamLogo}
                        alt={match.awayTeam}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  {match.stage.replace("_", " ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 리그 순위표 */}
      <div>
        <h3 className="text-xl font-bold mb-4">리그 순위표</h3>
        {standings.map((group) => (
          <div key={group.group} className="mb-8">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">순위</TableHead>
                    <TableHead className="w-1/3">
                      <div className="flex items-center ">팀</div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div
                        className="flex items-center justify-center cursor-pointer"
                        onClick={() => handleSort("playedGames")}
                      >
                        경기
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div
                        className="flex items-center justify-center cursor-pointer"
                        onClick={() => handleSort("won")}
                      >
                        승
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div
                        className="flex items-center justify-center cursor-pointer"
                        onClick={() => handleSort("draw")}
                      >
                        무
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div
                        className="flex items-center justify-center cursor-pointer"
                        onClick={() => handleSort("lost")}
                      >
                        패
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div
                        className="flex items-center justify-center cursor-pointer"
                        onClick={() => handleSort("goalsFor")}
                      >
                        득점
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div
                        className="flex items-center justify-center cursor-pointer"
                        onClick={() => handleSort("goalsAgainst")}
                      >
                        실점
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div
                        className="flex items-center justify-center cursor-pointer"
                        onClick={() => handleSort("goalDifference")}
                      >
                        득실
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div
                        className="flex items-center justify-center cursor-pointer"
                        onClick={() => handleSort("points")}
                      >
                        승점
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.table
                    .slice()
                    .sort((a, b) => {
                      let aValue, bValue;

                      if (sortField === "teamName") {
                        aValue = a.team.name;
                        bValue = b.team.name;
                      } else {
                        aValue = a[sortField];
                        bValue = b[sortField];
                      }

                      if (
                        typeof aValue === "string" &&
                        typeof bValue === "string"
                      ) {
                        return sortDirection === "asc"
                          ? aValue.localeCompare(bValue)
                          : bValue.localeCompare(aValue);
                      }

                      return sortDirection === "asc"
                        ? (aValue as number) - (bValue as number)
                        : (bValue as number) - (aValue as number);
                    })
                    .map((standing) => {
                      const positionInfo = getPositionInfo(standing.position);
                      return (
                        <TableRow
                          key={standing.team.id}
                          className={positionInfo.color}
                        >
                          <TableCell className="text-center font-medium">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-center">
                                    {standing.position}
                                    <Info className="ml-1 h-3 w-3" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{positionInfo.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="relative w-6 h-6 mr-2">
                                <Image
                                  src={standing.team.crest}
                                  alt={standing.team.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <span>
                                {translateTeamName(standing.team.name)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {standing.playedGames}
                          </TableCell>
                          <TableCell className="text-center">
                            {standing.won}
                          </TableCell>
                          <TableCell className="text-center">
                            {standing.draw}
                          </TableCell>
                          <TableCell className="text-center">
                            {standing.lost}
                          </TableCell>
                          <TableCell className="text-center">
                            {standing.goalsFor}
                          </TableCell>
                          <TableCell className="text-center">
                            {standing.goalsAgainst}
                          </TableCell>
                          <TableCell className="text-center">
                            {standing.goalDifference}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {standing.points}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}

        {/* 범례 */}
        <div className="mt-4 text-sm">
          <h4 className="font-semibold mb-2">범례:</h4>
          <div className="space-y-1">
            <div className="inline-block mr-2 mb-2 px-2 py-1 rounded bg-blue-600/20">
              16강 진출 (상위 8팀)
            </div>
            <div className="inline-block mr-2 mb-2 px-2 py-1 rounded bg-green-600/20">
              플레이오프 진출 (9-24위)
            </div>
            <div className="inline-block mr-2 mb-2 px-2 py-1 rounded bg-red-600/20">
              탈락 (25-36위)
            </div>
          </div>
        </div>
      </div>

      {/* 득점자 순위 */}
      {scorers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">득점자 순위</h3>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">순위</TableHead>
                  <TableHead>선수</TableHead>
                  <TableHead>팀</TableHead>
                  <TableHead className="text-center">경기</TableHead>
                  <TableHead className="text-center">득점</TableHead>
                  <TableHead className="text-center">도움</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scorers.map((scorer, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      {translatePlayerName(scorer.player.name)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="relative w-6 h-6 mr-2">
                          <Image
                            src={scorer.team.crest}
                            alt={scorer.team.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span>{translateTeamName(scorer.team.name)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {scorer.playedMatches}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {scorer.goals}
                    </TableCell>
                    <TableCell className="text-center">
                      {scorer.assists || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

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
    </div>
  );
}
