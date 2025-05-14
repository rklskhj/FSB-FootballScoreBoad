"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown } from "lucide-react"

type SortDirection = "asc" | "desc"

interface TopScorersTableProps {
  data: any[]
}

export function TopScorersTable({ data }: TopScorersTableProps) {
  const [sortField, setSortField] = useState<string>("goals")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] > b[sortField] ? 1 : -1
    } else {
      return a[sortField] < b[sortField] ? 1 : -1
    }
  })

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">순위</TableHead>
              <TableHead className="min-w-[180px]">선수</TableHead>
              <TableHead className="min-w-[150px]">팀</TableHead>
              <TableHead className="w-16 text-center cursor-pointer" onClick={() => handleSort("goals")}>
                <div className="flex items-center justify-center">
                  득점
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-16 text-center cursor-pointer" onClick={() => handleSort("penalties")}>
                <div className="flex items-center justify-center">
                  PK
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-16 text-center cursor-pointer" onClick={() => handleSort("gamesPlayed")}>
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
                <TableCell className="text-center font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center">{player.name}</div>
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
                    {player.team}
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold">{player.goals}</TableCell>
                <TableCell className="text-center">{player.penalties}</TableCell>
                <TableCell className="text-center">{player.gamesPlayed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
