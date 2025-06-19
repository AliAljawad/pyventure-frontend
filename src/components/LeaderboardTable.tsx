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
import { getUserProfile, makeAuthenticatedRequest } from "@/api/auth"; // Import auth functions

type SortField = "score" | "levels" | "attempts";

interface LeaderboardEntry {
  rank: number;
  user: {
    id: number;
    name: string;
    username: string;
    rank: string;
  };
  stats: {
    total_score: number;
    total_completed_levels: number;
    total_attempts: number;
  };
  progress?: number;
}

const LeaderboardTable = () => {
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to check authentication status
  const checkAuthentication = async () => {
    try {
      await getUserProfile();
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Authentication failed:", error);
      // Clear storage and redirect to login
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");

      // Show error toast
      toast.error("Please log in to view the leaderboard");

      // Navigate to login page
      window.location.href = "/login";
      return false;
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);

      // Check authentication first
      const isAuth = await checkAuthentication();
      if (!isAuth) {
        return;
      }

      // Make authenticated request to fetch leaderboard
      const response = await makeAuthenticatedRequest(
        `http://127.0.0.1:8000/api/leaderboard?limit=50`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard data");
      }

      const data = await response.json();

      // Calculate progress based on levels completed divided by 10
      const leaderboardWithProgress = data.map((entry: LeaderboardEntry) => ({
        ...entry,
        progress: Math.min(
          Math.round((entry.stats.total_completed_levels / 10) * 100),
          100
        ),
      }));

      setLeaderboard(leaderboardWithProgress);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Failed to fetch leaderboard data");

      // If it's an authentication error, redirect to login
      if (error instanceof Error && error.message.includes("401")) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        window.location.href = "/login";
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }

    // Sort the leaderboard based on the selected field
    const sortedLeaderboard = [...leaderboard].sort((a, b) => {
      let aValue, bValue;

      switch (field) {
        case "score":
          aValue = a.stats.total_score;
          bValue = b.stats.total_score;
          break;
        case "levels":
          aValue = a.stats.total_completed_levels;
          bValue = b.stats.total_completed_levels;
          break;
        case "attempts":
          aValue = a.stats.total_attempts;
          bValue = b.stats.total_attempts;
          break;
        default:
          aValue = a.stats.total_score;
          bValue = b.stats.total_score;
      }

      if (sortDirection === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    setLeaderboard(sortedLeaderboard);
  };

  const handleRefresh = () => {
    fetchLeaderboard();
  };

  // Show loading state while checking authentication
  if (!isAuthenticated && isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="flex items-center gap-2 text-gray-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Authenticating...</span>
        </div>
      </div>
    );
  }

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
              {leaderboard.map((entry, index) => (
                <tr
                  key={entry.user.id}
                  className={cn(
                    "hover:bg-space-nebula/10 transition-colors",
                    index % 2 === 0 ? "bg-space-deep-purple/10" : ""
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {entry.rank === 1 && (
                        <Trophy className="h-5 w-5 text-yellow-400 mr-2" />
                      )}
                      {entry.rank === 2 && (
                        <Medal className="h-5 w-5 text-gray-300 mr-2" />
                      )}
                      {entry.rank === 3 && (
                        <Medal className="h-5 w-5 text-amber-700 mr-2" />
                      )}
                      <span
                        className={cn(
                          "font-medium",
                          entry.rank === 1
                            ? "text-yellow-400"
                            : entry.rank === 2
                            ? "text-gray-300"
                            : entry.rank === 3
                            ? "text-amber-700"
                            : "text-white"
                        )}
                      >
                        {entry.rank}
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
                                  {entry.user.username
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${entry.user.username}`}
                                />
                              </Avatar>
                              {entry.rank <= 3 && (
                                <div
                                  className={cn(
                                    "absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px]",
                                    entry.rank === 1
                                      ? "bg-yellow-400"
                                      : entry.rank === 2
                                      ? "bg-gray-300"
                                      : "bg-amber-700"
                                  )}
                                >
                                  {entry.rank}
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="p-4 max-w-xs space-y-2">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback>
                                  {entry.user.username
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${entry.user.username}`}
                                />
                              </Avatar>
                              <div>
                                <p className="font-bold">{entry.user.name}</p>
                                <p className="text-xs text-gray-400">
                                  @{entry.user.username}
                                </p>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div>
                        <span className="font-medium text-white">
                          {entry.user.name}
                        </span>
                        <p className="text-xs text-gray-400">
                          @{entry.user.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-white">
                      {entry.stats.total_score.toLocaleString()}
                    </span>
                    <span className="text-space-nebula text-xs ml-1">pts</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-space-deep-purple flex items-center justify-center text-sm mr-2">
                        {entry.stats.total_completed_levels}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-white mr-1">
                        {entry.stats.total_attempts}
                      </span>
                      <span className="text-space-neon-pink">attempts</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-space-deep-purple/30 rounded-full h-2.5 mr-2 max-w-[100px]">
                        <div
                          className="bg-gradient-to-r from-space-nebula to-space-neon-cyan h-2.5 rounded-full"
                          style={{ width: `${entry.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-xs">
                        {entry.progress || 0}%
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
          Rankings update in real-time
        </p>
      </div>
    </div>
  );
};

export default LeaderboardTable;
