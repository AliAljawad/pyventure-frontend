import { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";

type TimeFrame = "allTime" | "weekly" | "daily";
type SortField = "score" | "levels" | "attempts";

interface LeaderboardUser {
  id: number;
  username: string;
  rank: string | null;
  total_score: number;
  total_completed_levels: number;
  total_attempts: number;
  time_spent: number;
  achievements: string[];
  progress: number;
}

const LeaderboardTable = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("allTime");
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:8000/api/leaderboard`,
        {
          params: {
            timeFrame,
            sortBy: sortField,
            limit: 10,
          },
        }
      );

      // Calculate progress based on the highest score
      const maxScore = Math.max(
        ...response.data.users.map((user: any) => user.total_score)
      );
      const usersWithProgress = response.data.users.map((user: any) => ({
        ...user,
        progress:
          maxScore > 0 ? Math.round((user.total_score / maxScore) * 100) : 0,
      }));

      setUsers(usersWithProgress);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Failed to fetch leaderboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFrame, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleRefresh = () => {
    fetchLeaderboard();
  };

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Global Rankings
          </h3>
          <p className="text-gray-400">
            See how you compare to Pythoneers across the galaxy
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex rounded-lg overflow-hidden border border-space-nebula/20">
            <Button
              onClick={() => setTimeFrame("allTime")}
              variant="ghost"
              className={cn(
                "rounded-none",
                timeFrame === "allTime"
                  ? "bg-space-nebula text-white"
                  : "text-gray-400 hover:text-white"
              )}
            >
              All Time
            </Button>
            <Button
              onClick={() => setTimeFrame("weekly")}
              variant="ghost"
              className={cn(
                "rounded-none",
                timeFrame === "weekly"
                  ? "bg-space-nebula text-white"
                  : "text-gray-400 hover:text-white"
              )}
            >
              Weekly
            </Button>
            <Button
              onClick={() => setTimeFrame("daily")}
              variant="ghost"
              className={cn(
                "rounded-none",
                timeFrame === "daily"
                  ? "bg-space-nebula text-white"
                  : "text-gray-400 hover:text-white"
              )}
            >
              Daily
            </Button>
          </div>

          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-space-neon-cyan text-space-neon-cyan hover:bg-space-neon-cyan/10"
            disabled={isLoading}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden cosmic-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-space-nebula/20 bg-space-deep-purple/30">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("score")}
                >
                  <div className="flex items-center">
                    Score
                    {sortField === "score" ? (
                      sortDirection === "desc" ? (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      )
                    ) : null}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("levels")}
                >
                  <div className="flex items-center">
                    Levels
                    {sortField === "levels" ? (
                      sortDirection === "desc" ? (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      )
                    ) : null}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("attempts")}
                >
                  <div className="flex items-center">
                    Attempts
                    {sortField === "attempts" ? (
                      sortDirection === "desc" ? (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      )
                    ) : null}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  className={cn(
                    "hover:bg-space-nebula/10 transition-colors",
                    index % 2 === 0 ? "bg-space-deep-purple/10" : ""
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index === 0 && (
                        <Trophy className="h-5 w-5 text-yellow-400 mr-2" />
                      )}
                      {index === 1 && (
                        <Medal className="h-5 w-5 text-gray-300 mr-2" />
                      )}
                      {index === 2 && (
                        <Medal className="h-5 w-5 text-amber-700 mr-2" />
                      )}
                      <span
                        className={cn(
                          "font-medium",
                          index === 0
                            ? "text-yellow-400"
                            : index === 1
                            ? "text-gray-300"
                            : index === 2
                            ? "text-amber-700"
                            : "text-white"
                        )}
                      >
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="relative">
                              <Avatar className="h-8 w-8 mr-3 border border-space-nebula/30">
                                <AvatarFallback className="bg-space-deep-purple text-white">
                                  {user.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`}
                                />
                              </Avatar>
                              {index < 3 && (
                                <div
                                  className={cn(
                                    "absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px]",
                                    index === 0
                                      ? "bg-yellow-400"
                                      : index === 1
                                      ? "bg-gray-300"
                                      : "bg-amber-700"
                                  )}
                                >
                                  {index + 1}
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="p-4 max-w-xs space-y-2">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback>
                                  {user.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`}
                                />
                              </Avatar>
                              <div>
                                <p className="font-bold">{user.username}</p>
                                <p className="text-xs text-gray-400">
                                  {user.rank || "Explorer"} •{" "}
                                  {formatTimeSpent(user.time_spent)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs font-medium mb-1">
                                Achievements:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {user.achievements.map((achievement) => (
                                  <Badge
                                    key={achievement}
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    {achievement}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="font-medium text-white">
                        {user.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-white">
                      {user.total_score.toLocaleString()}
                    </span>
                    <span className="text-space-nebula text-xs ml-1">pts</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-space-deep-purple flex items-center justify-center text-sm mr-2">
                        {user.total_completed_levels}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-white mr-1">
                        {user.total_attempts}
                      </span>
                      <span className="text-space-neon-pink">attempts</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-space-deep-purple/30 rounded-full h-2.5 mr-2 max-w-[100px]">
                        <div
                          className="bg-gradient-to-r from-space-nebula to-space-neon-cyan h-2.5 rounded-full"
                          style={{ width: `${user.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-xs">
                        {user.progress}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-gray-400 flex items-center">
          <Info className="h-4 w-4 mr-1" />
          Rankings update every 24 hours
        </p>
      </div>
    </div>
  );
};

export default LeaderboardTable;
