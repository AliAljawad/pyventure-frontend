
import { useState } from "react";
import { Trophy, Medal, ChevronDown, ChevronUp, RefreshCw, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Dummy data for the leaderboard
const leaderboardData = [
  { 
    id: 1, 
    username: "CodeNinja", 
    score: 9850, 
    progress: 95,
    avatar: "CN", 
    achievements: ["Python Master", "Algorithm Ace", "Bug Hunter"],
    level: 42,
    streak: 87
  },
  { 
    id: 2, 
    username: "QuantumCoder", 
    score: 9340, 
    progress: 92,
    avatar: "QC", 
    achievements: ["Data Scientist", "Web Developer", "AI Specialist"],
    level: 39,
    streak: 63
  },
  { 
    id: 3, 
    username: "ByteWizard", 
    score: 8970, 
    progress: 88,
    avatar: "BW", 
    achievements: ["Database Expert", "Frontend Wizard", "Code Optimiser"],
    level: 36,
    streak: 45
  },
  { 
    id: 4, 
    username: "SyntaxSage", 
    score: 8450, 
    progress: 85,
    avatar: "SS", 
    achievements: ["Clean Coder", "Fast Debugger"],
    level: 34,
    streak: 28
  },
  { 
    id: 5, 
    username: "PyExplorer", 
    score: 7890, 
    progress: 79,
    avatar: "PE", 
    achievements: ["Early Adopter", "Community Helper"],
    level: 31,
    streak: 14
  },
  { 
    id: 6, 
    username: "AlgorithmAce", 
    score: 7560, 
    progress: 75,
    avatar: "AA", 
    achievements: ["Problem Solver"],
    level: 30,
    streak: 21
  },
  { 
    id: 7, 
    username: "CodeCrusader", 
    score: 7230, 
    progress: 70,
    avatar: "CC", 
    achievements: ["Consistent Learner"],
    level: 28,
    streak: 42
  },
  { 
    id: 8, 
    username: "PythonPioneer", 
    score: 6910, 
    progress: 68,
    avatar: "PP", 
    achievements: ["Fast Learner"],
    level: 27,
    streak: 19
  },
  { 
    id: 9, 
    username: "DevDynamo", 
    score: 6540, 
    progress: 65,
    avatar: "DD", 
    achievements: ["Code Reviewer"],
    level: 26,
    streak: 7
  },
  { 
    id: 10, 
    username: "ScriptSorcerer", 
    score: 6230, 
    progress: 62,
    avatar: "SS", 
    achievements: ["Newcomer"],
    level: 25,
    streak: 5
  },
];

type TimeFrame = "allTime" | "weekly" | "daily";

const LeaderboardTable = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("allTime");
  const [sortField, setSortField] = useState<"score" | "streak" | "level">("score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(false);
  
  // Sort function
  const sortedData = [...leaderboardData].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] - b[sortField];
    } else {
      return b[sortField] - a[sortField];
    }
  });
  
  const handleSort = (field: "score" | "streak" | "level") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };
  
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Leaderboard refreshed!");
    }, 1000);
  };
  
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Global Rankings</h3>
          <p className="text-gray-400">See how you compare to Pythoneers across the galaxy</p>
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
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("score")}>
                  <div className="flex items-center">
                    Score
                    {sortField === "score" ? (
                      sortDirection === "desc" ? <ChevronDown className="h-4 w-4 ml-1" /> : <ChevronUp className="h-4 w-4 ml-1" />
                    ) : null}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("level")}>
                  <div className="flex items-center">
                    Level
                    {sortField === "level" ? (
                      sortDirection === "desc" ? <ChevronDown className="h-4 w-4 ml-1" /> : <ChevronUp className="h-4 w-4 ml-1" />
                    ) : null}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("streak")}>
                  <div className="flex items-center">
                    Streak
                    {sortField === "streak" ? (
                      sortDirection === "desc" ? <ChevronDown className="h-4 w-4 ml-1" /> : <ChevronUp className="h-4 w-4 ml-1" />
                    ) : null}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((user, index) => (
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
                      <span className={cn(
                        "font-medium",
                        index === 0 ? "text-yellow-400" : 
                        index === 1 ? "text-gray-300" : 
                        index === 2 ? "text-amber-700" : 
                        "text-white"
                      )}>
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
                                  {user.avatar}
                                </AvatarFallback>
                                <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} />
                              </Avatar>
                              {index < 3 && (
                                <div className={cn(
                                  "absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px]",
                                  index === 0 ? "bg-yellow-400" : 
                                  index === 1 ? "bg-gray-300" : 
                                  "bg-amber-700"
                                )}>
                                  {index + 1}
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="p-4 max-w-xs space-y-2">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback>{user.avatar}</AvatarFallback>
                                <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} />
                              </Avatar>
                              <div>
                                <p className="font-bold">{user.username}</p>
                                <p className="text-xs text-gray-400">Level {user.level} • {user.streak} day streak</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs font-medium mb-1">Achievements:</p>
                              <div className="flex flex-wrap gap-1">
                                {user.achievements.map((achievement) => (
                                  <Badge key={achievement} variant="secondary" className="text-[10px]">
                                    {achievement}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="font-medium text-white">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-white">{user.score.toLocaleString()}</span>
                    <span className="text-space-nebula text-xs ml-1">pts</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-space-deep-purple flex items-center justify-center text-sm mr-2">
                        {user.level}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-white mr-1">{user.streak}</span>
                      <span className="text-space-neon-pink">days</span>
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
                      <span className="text-white text-xs">{user.progress}%</span>
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
        <Button variant="link" className="text-space-nebula">
          View Full Rankings
        </Button>
      </div>
    </div>
  );
};

export default LeaderboardTable;
