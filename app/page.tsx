"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FootballDataStandings } from "@/components/football-data-standings";
import { TopPlayersTable } from "@/components/top-players-table";
import { FixturesTable } from "@/components/fixtures-table";
import { LeagueSkeleton } from "@/components/league-skeleton";
import { FixturesSkeleton } from "@/components/fixtures-skeleton";
import { ChampionsLeagueStandings } from "@/components/champions-league-standings";
import { usePlayersData } from "@/lib/playerDataService";
import { useFixturesData } from "@/lib/fixtureDataService";

// 리그 데이터
const leagues = [
  {
    id: "premier-league",
    name: "프리미어리그",
    country: "영국",
    logo: "https://crests.football-data.org/PL.png",
    flag: "/flags/england.svg",
    color: "bg-purple-600",
    apiFootballId: 39,
    footballDataId: 2021,
  },
  {
    id: "la-liga",
    name: "라리가",
    country: "스페인",
    logo: "https://crests.football-data.org/PD.png",
    flag: "/flags/spain.svg",
    color: "bg-orange-500",
    apiFootballId: 140,
    footballDataId: 2014,
  },
  {
    id: "serie-a",
    name: "세리에 A",
    country: "이탈리아",
    logo: "https://crests.football-data.org/SA.png",
    flag: "/flags/italy.svg",
    color: "bg-blue-600",
    apiFootballId: 135,
    footballDataId: 2019,
  },
  {
    id: "bundesliga",
    name: "분데스리가",
    country: "독일",
    logo: "https://crests.football-data.org/BL1.png",
    flag: "/flags/germany.svg",
    color: "bg-red-600",
    apiFootballId: 78,
    footballDataId: 2002,
  },
  {
    id: "ligue-1",
    name: "리그 1",
    country: "프랑스",
    logo: "https://crests.football-data.org/FL1.png",
    flag: "/flags/france.svg",
    color: "bg-green-600",
    apiFootballId: 61,
    footballDataId: 2015,
  },
  {
    id: "champions-league",
    name: "챔피언스리그",
    country: "유럽",
    logo: "https://crests.football-data.org/CL.png",
    flag: "/flags/europe.svg",
    color: "bg-blue-800",
    apiFootballId: 2,
    footballDataId: 2001,
  },
];

export default function Home() {
  const [activeLeague, setActiveLeague] = useState<string>("premier-league");
  const [activeTab, setActiveTab] = useState<string>("standings");
  const [isUsingCache, setIsUsingCache] = useState<boolean>(false);

  // React Query 훅 사용
  const { data: playersData, isLoading: isPlayersLoading } =
    usePlayersData(activeLeague);

  const { data: fixturesData, isLoading: isFixturesLoading } =
    useFixturesData(activeLeague);

  // 캐시 상태 업데이트
  useEffect(() => {
    if (playersData?.isUsingCache || fixturesData?.isUsingCache) {
      setIsUsingCache(true);
    } else {
      setIsUsingCache(false);
    }
  }, [playersData, fixturesData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const homeRouter = () => {
    window.scrollTo(0, 0);
    setActiveLeague("premier-league");
    setActiveTab("standings");
  };

  // 로딩 상태 계산
  const isLoading = isPlayersLoading || isFixturesLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 onClick={homeRouter} className="text-3xl font-bold cursor-pointer">
          ⚽FSB
        </h1>
        <ThemeToggle />
      </div>

      {/* 리그 선택 탭 */}
      <Tabs
        value={activeLeague}
        onValueChange={setActiveLeague}
        className="mb-8 max-w-[1000px] mx-auto"
      >
        <TabsList className="grid grid-cols-6 mb-4">
          {leagues.map((league) => (
            <TabsTrigger
              key={league.id}
              value={league.id}
              className="flex items-center"
            >
              <div className="relative w-6 h-6 mr-2">
                <Image
                  src={league.logo || "/placeholder.svg"}
                  alt={`${league.name} 로고`}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="hidden md:inline">{league.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* 각 리그 콘텐츠 */}
        {leagues.map((league) => (
          <TabsContent key={league.id} value={league.id} className="mt-0">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
              <div className="relative w-16 h-16 mr-4">
                <Image
                  src={league.logo || "/placeholder.svg"}
                  alt={`${league.name} 로고`}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{league.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 flex items-center">
                  <Image
                    src={league.flag}
                    alt={league.country}
                    width={16}
                    height={12}
                    className="mr-1"
                  />
                  {league.country}
                  {activeTab === "standings" && league.footballDataId && (
                    <span className="ml-2 text-xs">(2024/2025)</span>
                  )}
                </p>
              </div>
            </div>

            {/* 데이터 탭 */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full max-w-[1000px] mx-auto"
            >
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="standings">순위표</TabsTrigger>
                <TabsTrigger value="players">개인 순위</TabsTrigger>
                <TabsTrigger value="fixtures">경기 일정</TabsTrigger>
              </TabsList>

              <TabsContent value="standings">
                {isLoading ? (
                  <LeagueSkeleton />
                ) : activeLeague === "champions-league" ? (
                  <ChampionsLeagueStandings
                    onCacheStatusChange={setIsUsingCache}
                  />
                ) : (
                  <FootballDataStandings
                    leagueId={league.footballDataId}
                    season={2024}
                    onCacheStatusChange={setIsUsingCache}
                  />
                )}
              </TabsContent>

              <TabsContent value="players">
                {isPlayersLoading ? (
                  <LeagueSkeleton />
                ) : (
                  <TopPlayersTable data={playersData?.players || []} />
                )}
              </TabsContent>

              <TabsContent value="fixtures">
                {isFixturesLoading ? (
                  <FixturesSkeleton />
                ) : (
                  <FixturesTable
                    data={fixturesData || { fixtures: [], groupedFixtures: {} }}
                  />
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
