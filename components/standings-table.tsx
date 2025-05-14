"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

type SortDirection = "asc" | "desc"

interface StandingsTableProps {
  data: any[]
  leagueId?: string
}

// 리그별 유럽대회 진출 및 강등 기준
const leagueQualificationRules: Record<
  string,
  {
    name: string
    positions: number[]
    color: string
    description: string
    bonusSpot?: boolean // 보너스 출전권 여부
  }[]
> = {
  "premier-league": [
    { name: "champions-league", positions: [1, 2, 3, 4], color: "bg-blue-600", description: "UEFA 챔피언스리그 진출" },
    {
      name: "champions-league-bonus",
      positions: [5],
      color: "bg-blue-400",
      description: "UEFA 챔피언스리그 진출 (보너스 출전권)",
      bonusSpot: true,
    },
    { name: "europa-league", positions: [6], color: "bg-orange-500", description: "UEFA 유로파리그 진출" },
    { name: "conference-league", positions: [7], color: "bg-green-600", description: "UEFA 컨퍼런스리그 진출" },
    { name: "relegation", positions: [18, 19, 20], color: "bg-red-600", description: "강등" },
  ],
  "la-liga": [
    { name: "champions-league", positions: [1, 2, 3, 4], color: "bg-blue-600", description: "UEFA 챔피언스리그 진출" },
    {
      name: "champions-league-bonus",
      positions: [5],
      color: "bg-blue-400",
      description: "UEFA 챔피언스리그 진출 (보너스 출전권)",
      bonusSpot: true,
    },
    { name: "europa-league", positions: [6, 7], color: "bg-orange-500", description: "UEFA 유로파리그 진출" },
    { name: "relegation", positions: [18, 19, 20], color: "bg-red-600", description: "강등" },
  ],
  "serie-a": [
    { name: "champions-league", positions: [1, 2, 3, 4], color: "bg-blue-600", description: "UEFA 챔피언스리그 진출" },
    {
      name: "champions-league-bonus",
      positions: [5],
      color: "bg-blue-400",
      description: "UEFA 챔피언스리그 진출 (보너스 출전권)",
      bonusSpot: true,
    },
    { name: "europa-league", positions: [6, 7], color: "bg-orange-500", description: "UEFA 유로파리그 진출" },
    { name: "conference-league", positions: [8], color: "bg-green-600", description: "UEFA 컨퍼런스리그 진출" },
    { name: "relegation", positions: [18, 19, 20], color: "bg-red-600", description: "강등" },
  ],
  bundesliga: [
    { name: "champions-league", positions: [1, 2, 3, 4], color: "bg-blue-600", description: "UEFA 챔피언스리그 진출" },
    {
      name: "champions-league-bonus",
      positions: [5],
      color: "bg-blue-400",
      description: "UEFA 챔피언스리그 진출 (보너스 출전권)",
      bonusSpot: true,
    },
    { name: "europa-league", positions: [6, 7], color: "bg-orange-500", description: "UEFA 유로파리그 진출" },
    { name: "relegation-playoff", positions: [16], color: "bg-yellow-500", description: "강등 플레이오프" },
    { name: "relegation", positions: [17, 18], color: "bg-red-600", description: "강등" },
  ],
  "ligue-1": [
    { name: "champions-league", positions: [1, 2, 3], color: "bg-blue-600", description: "UEFA 챔피언스리그 진출" },
    { name: "champions-league-qual", positions: [4], color: "bg-blue-400", description: "UEFA 챔피언스리그 예선 진출" },
    { name: "europa-league", positions: [5], color: "bg-orange-500", description: "UEFA 유로파리그 진출" },
    { name: "relegation-playoff", positions: [16], color: "bg-yellow-500", description: "강등 플레이오프" },
    { name: "relegation", positions: [17, 18], color: "bg-red-600", description: "강등" },
  ],
}

export function StandingsTable({ data, leagueId = "premier-league" }: StandingsTableProps) {
  const [sortField, setSortField] = useState<string>("position")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [showBonusSpots, setShowBonusSpots] = useState<boolean>(true) // 보너스 출전권 표시 여부

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection(field === "position" ? "asc" : "desc") // 순위는 기본적으로 오름차순, 나머지는 내림차순
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] > b[sortField] ? 1 : -1
    } else {
      return a[sortField] < b[sortField] ? 1 : -1
    }
  })

  // 리그별 규정 가져오기
  const qualificationRules = leagueQualificationRules[leagueId] || leagueQualificationRules["premier-league"]

  // 보너스 출전권 필터링
  const filteredRules = showBonusSpots ? qualificationRules : qualificationRules.filter((rule) => !rule.bonusSpot)

  // 순위에 따른 색상 및 설명 가져오기
  const getPositionStyle = (position: number) => {
    for (const rule of filteredRules) {
      if (rule.positions.includes(position)) {
        return {
          color: rule.color,
          description: rule.description,
          bonusSpot: rule.bonusSpot || false,
        }
      }
    }
    return { color: "", description: "", bonusSpot: false }
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
                  2024-25 시즌부터 UEFA 챔피언스리그는 리그 성적에 따라 보너스 출전권이 부여됩니다. 이에 따라 일부
                  리그는 기존보다 더 많은 팀이 챔피언스리그에 진출할 수 있습니다.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center cursor-pointer" onClick={() => handleSort("position")}>
                  <div className="flex items-center justify-center">
                    순위
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="min-w-[180px]">팀</TableHead>
                <TableHead className="w-16 text-center cursor-pointer" onClick={() => handleSort("played")}>
                  <div className="flex items-center justify-center">
                    경기
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-16 text-center cursor-pointer" onClick={() => handleSort("points")}>
                  <div className="flex items-center justify-center">
                    승점
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-16 text-center cursor-pointer" onClick={() => handleSort("won")}>
                  <div className="flex items-center justify-center">
                    승
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-16 text-center cursor-pointer" onClick={() => handleSort("drawn")}>
                  <div className="flex items-center justify-center">
                    무
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-16 text-center cursor-pointer" onClick={() => handleSort("lost")}>
                  <div className="flex items-center justify-center">
                    패
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-16 text-center cursor-pointer" onClick={() => handleSort("goalsFor")}>
                  <div className="flex items-center justify-center">
                    득점
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-16 text-center cursor-pointer" onClick={() => handleSort("goalsAgainst")}>
                  <div className="flex items-center justify-center">
                    실점
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-16 text-center cursor-pointer" onClick={() => handleSort("goalDifference")}>
                  <div className="flex items-center justify-center">
                    득실차
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((team) => {
                const positionStyle = getPositionStyle(team.position)
                return (
                  <TableRow key={team.id}>
                    <TableCell className="text-center font-medium">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center justify-center w-full">
                            {positionStyle.color && (
                              <span className={`inline-block w-1 h-6 ${positionStyle.color} mr-2`}></span>
                            )}
                            {team.position}
                            {positionStyle.bonusSpot && <span className="ml-1 text-xs text-blue-500">*</span>}
                          </TooltipTrigger>
                          {positionStyle.description && (
                            <TooltipContent side="right">
                              <p>{positionStyle.description}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="relative w-6 h-6 mr-2">
                          <img
                            src={team.logo || "/placeholder.svg"}
                            alt={`${team.name} 로고`}
                            className="object-contain w-full h-full"
                          />
                        </div>
                        {team.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{team.played}</TableCell>
                    <TableCell className="text-center font-bold">{team.points}</TableCell>
                    <TableCell className="text-center">{team.won}</TableCell>
                    <TableCell className="text-center">{team.drawn}</TableCell>
                    <TableCell className="text-center">{team.lost}</TableCell>
                    <TableCell className="text-center">{team.goalsFor}</TableCell>
                    <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                    <TableCell className="text-center">{team.goalDifference}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-4 mt-4">
        {filteredRules.map((rule, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-3 h-3 ${rule.color} mr-2`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {rule.description}
              {rule.bonusSpot && <span className="ml-1 text-xs text-blue-500">*</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
