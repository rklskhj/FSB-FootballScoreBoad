"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ko } from "date-fns/locale"
import { ArrowLeft, Calendar, Clock, MapPin, User } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Player {
  number: number
  name: string
  position: string
}

interface Team {
  startingXI: Player[]
  substitutes: Player[]
  coach: string
}

interface Goal {
  team: "home" | "away"
  player: string
  minute: number
  isOwnGoal: boolean
  isPenalty: boolean
}

interface CardInfo {
  team: "home" | "away"
  player: string
  minute: number
  type: "yellow" | "red"
}

interface Stats {
  possession: { home: number; away: number }
  shots: { home: number; away: number }
  shotsOnTarget: { home: number; away: number }
  corners: { home: number; away: number }
  fouls: { home: number; away: number }
  offsides: { home: number; away: number }
  yellowCards: { home: number; away: number }
  redCards: { home: number; away: number }
}

interface FixtureDetail {
  id: number
  date: string
  status: string
  homeTeam: string
  awayTeam: string
  homeTeamLogo: string
  awayTeamLogo: string
  homeScore: number | null
  awayScore: number | null
  stadium: string
  round: string
  attendance: number
  referee: string
  league: string
  leagueName: string
  goals: Goal[]
  cards: CardInfo[]
  lineups: {
    home: Team
    away: Team
  }
  stats: Stats
}

export default function FixtureDetailPage() {
  const params = useParams()
  const router = useRouter()
  const fixtureId = params.id as string

  const [fixture, setFixture] = useState<FixtureDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFixtureDetail = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/fixture/${fixtureId}`)
        if (!response.ok) {
          throw new Error("경기 정보를 불러오는데 실패했습니다.")
        }
        const data = await response.json()
        setFixture(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchFixtureDetail()
  }, [fixtureId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로 가기
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">경기 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !fixture) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로 가기
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-red-500 dark:text-red-400">{error || "경기 정보를 찾을 수 없습니다."}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로 가기
        </button>
        <ThemeToggle />
      </div>

      <div className="mb-6">
        <Link href={`/league/${fixture.league}`} className="text-sm font-medium text-primary hover:underline">
          {fixture.leagueName}
        </Link>
        <h1 className="text-2xl font-bold mt-2">{fixture.round}</h1>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
              <Calendar className="h-4 w-4 mr-1" />
              {format(parseISO(fixture.date), "yyyy년 M월 d일 (EEE)", { locale: ko })}
              <Clock className="h-4 w-4 ml-3 mr-1" />
              {format(parseISO(fixture.date), "a h:mm", { locale: ko })}
            </div>
            <div>
              {fixture.status === "FT" ? (
                <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                  경기 종료
                </Badge>
              ) : fixture.status === "LIVE" ? (
                <Badge variant="destructive">LIVE</Badge>
              ) : (
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                  예정됨
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-7 items-center gap-4 py-4">
            <div className="col-span-3 flex flex-col items-center md:items-end">
              <div className="w-16 h-16 mb-2">
                <img
                  src={fixture.homeTeamLogo || "/placeholder.svg"}
                  alt={`${fixture.homeTeam} 로고`}
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-lg font-bold text-center md:text-right">{fixture.homeTeam}</h2>
            </div>

            <div className="col-span-1 flex justify-center">
              {fixture.status === "NS" ? (
                <div className="text-xl font-bold">vs</div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-bold">{fixture.homeScore}</span>
                  <span className="mx-2 text-gray-400">-</span>
                  <span className="text-3xl font-bold">{fixture.awayScore}</span>
                </div>
              )}
            </div>

            <div className="col-span-3 flex flex-col items-center md:items-start">
              <div className="w-16 h-16 mb-2">
                <img
                  src={fixture.awayTeamLogo || "/placeholder.svg"}
                  alt={`${fixture.awayTeam} 로고`}
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-lg font-bold text-center md:text-left">{fixture.awayTeam}</h2>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {fixture.stadium} ({fixture.attendance.toLocaleString()}명)
            </div>
            <div className="hidden sm:block">•</div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              심판: {fixture.referee}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="summary">요약</TabsTrigger>
          <TabsTrigger value="lineups">라인업</TabsTrigger>
          <TabsTrigger value="stats">통계</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 골 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>골</CardTitle>
              </CardHeader>
              <CardContent>
                {fixture.goals.length > 0 ? (
                  <div className="space-y-4">
                    {fixture.goals.map((goal, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-12 text-center font-medium">{goal.minute}'</div>
                        <div className={`flex-1 ${goal.team === "home" ? "text-left" : "text-right"}`}>
                          <div className="font-medium">
                            {goal.player} {goal.isPenalty && "(PK)"} {goal.isOwnGoal && "(OG)"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {goal.team === "home" ? fixture.homeTeam : fixture.awayTeam}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">골 정보가 없습니다.</div>
                )}
              </CardContent>
            </Card>

            {/* 카드 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>카드</CardTitle>
              </CardHeader>
              <CardContent>
                {fixture.cards.length > 0 ? (
                  <div className="space-y-4">
                    {fixture.cards.map((card, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-12 text-center font-medium">{card.minute}'</div>
                        <div
                          className={`w-4 h-6 mx-2 rounded-sm ${
                            card.type === "yellow" ? "bg-yellow-400" : "bg-red-600"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <div className="font-medium">{card.player}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {card.team === "home" ? fixture.homeTeam : fixture.awayTeam}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">카드 정보가 없습니다.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lineups">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 홈팀 라인업 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 mr-2">
                    <img
                      src={fixture.homeTeamLogo || "/placeholder.svg"}
                      alt={`${fixture.homeTeam} 로고`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {fixture.homeTeam}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">감독</h3>
                  <p>{fixture.lineups.home.coach}</p>
                </div>
                <Separator className="my-4" />
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">선발</h3>
                  <div className="space-y-2">
                    {fixture.lineups.home.startingXI.map((player, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 text-center font-medium">{player.number}</div>
                        <div className="flex-1">{player.name}</div>
                        <div className="w-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          {player.position}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator className="my-4" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">교체</h3>
                  <div className="space-y-2">
                    {fixture.lineups.home.substitutes.map((player, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 text-center font-medium">{player.number}</div>
                        <div className="flex-1">{player.name}</div>
                        <div className="w-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          {player.position}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 원정팀 라인업 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 mr-2">
                    <img
                      src={fixture.awayTeamLogo || "/placeholder.svg"}
                      alt={`${fixture.awayTeam} 로고`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {fixture.awayTeam}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">감독</h3>
                  <p>{fixture.lineups.away.coach}</p>
                </div>
                <Separator className="my-4" />
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">선발</h3>
                  <div className="space-y-2">
                    {fixture.lineups.away.startingXI.map((player, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 text-center font-medium">{player.number}</div>
                        <div className="flex-1">{player.name}</div>
                        <div className="w-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          {player.position}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator className="my-4" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">교체</h3>
                  <div className="space-y-2">
                    {fixture.lineups.away.substitutes.map((player, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 text-center font-medium">{player.number}</div>
                        <div className="flex-1">{player.name}</div>
                        <div className="w-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          {player.position}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>경기 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 점유율 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{fixture.stats.possession.home}%</span>
                    <span className="text-gray-500 dark:text-gray-400">점유율</span>
                    <span className="font-medium">{fixture.stats.possession.away}%</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="bg-blue-500" style={{ width: `${fixture.stats.possession.home}%` }}></div>
                    <div className="bg-red-500" style={{ width: `${fixture.stats.possession.away}%` }}></div>
                  </div>
                </div>

                {/* 슈팅 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{fixture.stats.shots.home}</span>
                    <span className="text-gray-500 dark:text-gray-400">슈팅</span>
                    <span className="font-medium">{fixture.stats.shots.away}</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="bg-blue-500"
                      style={{
                        width: `${
                          (fixture.stats.shots.home / (fixture.stats.shots.home + fixture.stats.shots.away)) * 100
                        }%`,
                      }}
                    ></div>
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${
                          (fixture.stats.shots.away / (fixture.stats.shots.home + fixture.stats.shots.away)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* 유효슈팅 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{fixture.stats.shotsOnTarget.home}</span>
                    <span className="text-gray-500 dark:text-gray-400">유효슈팅</span>
                    <span className="font-medium">{fixture.stats.shotsOnTarget.away}</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="bg-blue-500"
                      style={{
                        width: `${
                          (fixture.stats.shotsOnTarget.home /
                            (fixture.stats.shotsOnTarget.home + fixture.stats.shotsOnTarget.away)) *
                          100
                        }%`,
                      }}
                    ></div>
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${
                          (fixture.stats.shotsOnTarget.away /
                            (fixture.stats.shotsOnTarget.home + fixture.stats.shotsOnTarget.away)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* 코너킥 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{fixture.stats.corners.home}</span>
                    <span className="text-gray-500 dark:text-gray-400">코너킥</span>
                    <span className="font-medium">{fixture.stats.corners.away}</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="bg-blue-500"
                      style={{
                        width: `${
                          (fixture.stats.corners.home / (fixture.stats.corners.home + fixture.stats.corners.away)) * 100
                        }%`,
                      }}
                    ></div>
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${
                          (fixture.stats.corners.away / (fixture.stats.corners.home + fixture.stats.corners.away)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* 파울 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{fixture.stats.fouls.home}</span>
                    <span className="text-gray-500 dark:text-gray-400">파울</span>
                    <span className="font-medium">{fixture.stats.fouls.away}</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="bg-blue-500"
                      style={{
                        width: `${
                          (fixture.stats.fouls.home / (fixture.stats.fouls.home + fixture.stats.fouls.away)) * 100
                        }%`,
                      }}
                    ></div>
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${
                          (fixture.stats.fouls.away / (fixture.stats.fouls.home + fixture.stats.fouls.away)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* 오프사이드 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{fixture.stats.offsides.home}</span>
                    <span className="text-gray-500 dark:text-gray-400">오프사이드</span>
                    <span className="font-medium">{fixture.stats.offsides.away}</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="bg-blue-500"
                      style={{
                        width: `${
                          (fixture.stats.offsides.home /
                            (fixture.stats.offsides.home + fixture.stats.offsides.away || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${
                          (fixture.stats.offsides.away /
                            (fixture.stats.offsides.home + fixture.stats.offsides.away || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* 옐로카드 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{fixture.stats.yellowCards.home}</span>
                    <span className="text-gray-500 dark:text-gray-400">옐로카드</span>
                    <span className="font-medium">{fixture.stats.yellowCards.away}</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="bg-blue-500"
                      style={{
                        width: `${
                          (fixture.stats.yellowCards.home /
                            (fixture.stats.yellowCards.home + fixture.stats.yellowCards.away || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${
                          (fixture.stats.yellowCards.away /
                            (fixture.stats.yellowCards.home + fixture.stats.yellowCards.away || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* 레드카드 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{fixture.stats.redCards.home}</span>
                    <span className="text-gray-500 dark:text-gray-400">레드카드</span>
                    <span className="font-medium">{fixture.stats.redCards.away}</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="bg-blue-500"
                      style={{
                        width: `${
                          (fixture.stats.redCards.home /
                            (fixture.stats.redCards.home + fixture.stats.redCards.away || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${
                          (fixture.stats.redCards.away /
                            (fixture.stats.redCards.home + fixture.stats.redCards.away || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
