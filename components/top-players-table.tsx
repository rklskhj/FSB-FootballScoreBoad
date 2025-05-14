"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { translateTeamName } from "@/lib/teamNames";
import { translatePlayerName } from "@/lib/playerNames";

type SortDirection = "asc" | "desc";

interface TopPlayersTableProps {
  data: any[] | undefined;
}

export function TopPlayersTable({ data = [] }: TopPlayersTableProps) {
  // 정렬 상태
  const [sortField, setSortField] = useState<string>("goals");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // 정렬 핸들러
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p>개인 순위 데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  // 정렬된 데이터
  const sortedData = [...data].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14 text-center whitespace-nowrap">
                순위
              </TableHead>
              <TableHead className="min-w-[160px]">선수</TableHead>
              <TableHead className="min-w-[140px]">팀</TableHead>
              <TableHead
                className="w-20 text-center cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("goals")}
              >
                <div className="flex items-center justify-center">
                  득점
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="w-24 text-center cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("assists")}
              >
                <div className="flex items-center justify-center">
                  어시스트
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="w-16 text-center cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("penalties")}
              >
                <div className="flex items-center justify-center">
                  PK
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="w-16 text-center cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("shots")}
              >
                <div className="flex items-center justify-center">
                  슛
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="w-16 text-center cursor-pointer whitespace-nowrap"
                onClick={() => handleSort("gamesPlayed")}
              >
                <div className="flex items-center justify-center">
                  경기
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((player, index) => (
              <TableRow key={player.id}>
                <TableCell className="text-center font-medium">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {translatePlayerName(player.name)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="relative w-6 h-6 mr-2">
                      <img
                        src={player.teamLogo || "/placeholder.svg"}
                        alt={`${player.team} 로고`}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    {translateTeamName(player.team)}
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold">
                  {player.goals}
                </TableCell>
                <TableCell className="text-center">
                  {player.assists || 0}
                </TableCell>
                <TableCell className="text-center">
                  {player.penalties || 0}
                </TableCell>
                <TableCell className="text-center">
                  {player.shots || "-"}
                </TableCell>
                <TableCell className="text-center">
                  {player.gamesPlayed}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
