import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Terminal, Star, BookOpen, Trophy, Code } from "lucide-react";

// Define types for our API responses
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  rank: string;
}

interface UserStats {
  user_id: number;
  total_attempts: number;
  total_completed_levels: number;
  total_score: number;
  time_spent: number;
}

interface Level {
  id: number;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

interface UserProgress {
  user_id: number;
  level_id: number;
  is_completed: boolean;
  score: number;
  attempts: number;
  last_updated: string;
  level: Level;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon_url: string;
  earned_at: string;
}

interface ProfileData {
  user: User;
  stats: UserStats;
  progress: UserProgress[];
  achievements: Achievement[];
}

const Profile = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/profile",
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            withCredentials: true,
          }
        );
        setProfileData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data. Please try again later.");
        setLoading(false);
      }
    };

    fetchProfileData();
    document.title = "Profile - PyVenture";
  }, []);

  // Calculate completion percentage for a category
  const calculateCategoryCompletion = (category: string): number => {
    if (!profileData?.progress) return 0;

    const categoryLevels = profileData.progress.filter(
      (p) => p.level.category === category
    );
    if (categoryLevels.length === 0) return 0;

    const completedLevels = categoryLevels.filter((p) => p.is_completed).length;
    return Math.round((completedLevels / categoryLevels.length) * 100);
  };

  // Calculate completion percentage for a difficulty
  const calculateDifficultyCompletion = (
    difficulty: "easy" | "medium" | "hard"
  ): { completed: number; total: number } => {
    if (!profileData?.progress) return { completed: 0, total: 0 };

    const difficultyLevels = profileData.progress.filter(
      (p) => p.level.difficulty === difficulty
    );
    const completedLevels = difficultyLevels.filter(
      (p) => p.is_completed
    ).length;

    return {
      completed: completedLevels,
      total: difficultyLevels.length,
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse text-xl">Loading profile data...</div>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl text-red-500">{error}</div>
            <button
              className="mt-4 px-4 py-2 bg-space-nebula rounded-md hover:bg-space-nebula/80"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  // No profile data
  if (!profileData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl">
              No profile data available. Please log in.
            </div>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  // Get initial letters for avatar
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get difficulty level badge color
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-600 hover:bg-green-700";
      case "medium":
        return "bg-space-meteor-orange hover:bg-space-meteor-orange/80";
      case "hard":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-space-nebula hover:bg-space-nebula/80";
    }
  };

  const { user, stats, progress, achievements } = profileData;

  // Group progress by category
  const categories = [...new Set(progress.map((p) => p.level.category))];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="glow-text">Explorer Profile</span>
            </h1>
            <p className="text-xl text-gray-300">
              Track your progress, achievements, and Python mastery journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Summary Card */}
            <Card className="cosmic-card p-6 col-span-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-space-nebula to-space-neon-cyan flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-white">
                    {getInitials(user.name)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                <p className="text-gray-400 mb-4">
                  {user.rank || "Python Explorer"}
                </p>

                <div className="flex space-x-2 mb-6">
                  <Badge className="bg-space-nebula hover:bg-space-nebula/80">
                    Level {Math.floor(stats.total_score / 100) + 1}
                  </Badge>
                  <Badge className="bg-space-meteor-orange hover:bg-space-meteor-orange/80">
                    {stats.total_completed_levels > 20
                      ? "Advanced"
                      : stats.total_completed_levels > 10
                      ? "Intermediate"
                      : "Beginner"}
                  </Badge>
                </div>

                <div className="w-full space-y-4">
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex flex-col items-center p-3 bg-space-deep-purple/20 rounded-lg">
                      <Trophy className="h-5 w-5 text-space-meteor-orange mb-1" />
                      <span className="text-sm text-gray-300">
                        {stats.total_completed_levels}
                      </span>
                      <span className="text-xs text-gray-500">
                        Challenges Completed
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-space-deep-purple/20 rounded-lg">
                      <Star className="h-5 w-5 text-space-nebula mb-1" />
                      <span className="text-sm text-gray-300">
                        {stats.total_score}
                      </span>
                      <span className="text-xs text-gray-500">Total Score</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-space-deep-purple/20 rounded-lg">
                      <Terminal className="h-5 w-5 text-space-neon-cyan mb-1" />
                      <span className="text-sm text-gray-300">
                        {stats.total_attempts}
                      </span>
                      <span className="text-xs text-gray-500">
                        Total Attempts
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-space-deep-purple/20 rounded-lg">
                      <BookOpen className="h-5 w-5 text-space-nebula mb-1" />
                      <span className="text-sm text-gray-300">
                        {Math.floor(stats.time_spent / 60)}h{" "}
                        {stats.time_spent % 60}m
                      </span>
                      <span className="text-xs text-gray-500">Time Spent</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Content Area */}
            <div className="col-span-1 lg:col-span-2">
              <Tabs defaultValue="achievements">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger
                    value="achievements"
                    className="data-[state=active]:bg-space-nebula"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Achievements
                  </TabsTrigger>
                  <TabsTrigger
                    value="progress"
                    className="data-[state=active]:bg-space-nebula"
                  >
                    <Terminal className="h-4 w-4 mr-2" />
                    Progress
                  </TabsTrigger>
                  <TabsTrigger
                    value="stats"
                    className="data-[state=active]:bg-space-nebula"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Stats
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="achievements" className="space-y-4">
                  <Card className="cosmic-card overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-4">
                        Recent Achievements
                      </h3>
                      {achievements.length > 0 ? (
                        <div className="space-y-4">
                          {achievements.slice(0, 5).map((achievement, i) => {
                            // Calculate days since achievement was earned
                            const earnedDate = new Date(achievement.earned_at);
                            const today = new Date();
                            const diffTime = Math.abs(
                              today.getTime() - earnedDate.getTime()
                            );
                            const diffDays = Math.ceil(
                              diffTime / (1000 * 60 * 60 * 24)
                            );

                            let timeAgo;
                            if (diffDays === 0) timeAgo = "today";
                            else if (diffDays === 1) timeAgo = "yesterday";
                            else if (diffDays < 7)
                              timeAgo = `${diffDays} days ago`;
                            else if (diffDays < 30)
                              timeAgo = `${Math.floor(diffDays / 7)} weeks ago`;
                            else
                              timeAgo = `${Math.floor(
                                diffDays / 30
                              )} months ago`;

                            return (
                              <div
                                key={i}
                                className="flex items-center p-3 bg-space-deep-purple/20 rounded-lg"
                              >
                                <div className="mr-4">
                                  <Award className="h-5 w-5 text-yellow-500" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">
                                    {achievement.title}
                                  </h4>
                                  <p className="text-sm text-gray-400">
                                    {achievement.description}
                                  </p>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {timeAgo}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-400">
                          No achievements earned yet. Complete challenges to
                          earn achievements!
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card className="cosmic-card p-6">
                    <h3 className="text-xl font-bold mb-4">
                      Achievements Progress
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {[
                        {
                          name: "First Steps",
                          icon: <Terminal className="h-8 w-8" />,
                          unlocked: stats.total_completed_levels >= 1,
                        },
                        {
                          name: "Loop Explorer",
                          icon: <Code className="h-8 w-8" />,
                          unlocked: calculateCategoryCompletion("Loops") >= 50,
                        },
                        {
                          name: "Function Master",
                          icon: <BookOpen className="h-8 w-8" />,
                          unlocked:
                            calculateCategoryCompletion("Functions") >= 50,
                        },
                        {
                          name: "OOP Wizard",
                          icon: <Star className="h-8 w-8" />,
                          unlocked: calculateCategoryCompletion("OOP") >= 50,
                        },
                        {
                          name: "API Explorer",
                          icon: <Terminal className="h-8 w-8" />,
                          unlocked: calculateCategoryCompletion("API") >= 30,
                        },
                        {
                          name: "Database Guru",
                          icon: <Trophy className="h-8 w-8" />,
                          unlocked:
                            calculateCategoryCompletion("Database") >= 30,
                        },
                      ].map((badge, i) => (
                        <div
                          key={i}
                          className={`flex flex-col items-center p-4 rounded-lg ${
                            badge.unlocked
                              ? "bg-space-deep-purple/30"
                              : "bg-space-deep-purple/10 opacity-50"
                          }`}
                        >
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${
                              badge.unlocked
                                ? "bg-gradient-to-r from-space-nebula to-space-neon-cyan"
                                : "bg-space-deep-purple/20"
                            }`}
                          >
                            {badge.icon}
                          </div>
                          <span className="text-sm text-center">
                            {badge.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="progress" className="space-y-4">
                  <Card className="cosmic-card p-6">
                    <h3 className="text-xl font-bold mb-4">Learning Path</h3>
                    {categories.length > 0 ? (
                      <div className="space-y-6">
                        {categories.map((category, index) => {
                          const completion =
                            calculateCategoryCompletion(category);
                          return (
                            <div key={index}>
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">{category}</span>
                                <span
                                  className={
                                    completion === 100
                                      ? "text-green-500"
                                      : "text-space-nebula"
                                  }
                                >
                                  {completion}%
                                </span>
                              </div>
                              <Progress
                                value={completion}
                                className="h-2 bg-space-deep-purple/30"
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        No learning progress yet. Start a challenge to begin
                        your journey!
                      </div>
                    )}
                  </Card>

                  <Card className="cosmic-card p-6">
                    <h3 className="text-xl font-bold mb-4">Recent Levels</h3>
                    {progress.length > 0 ? (
                      <div className="space-y-4">
                        {progress.slice(0, 5).map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center p-3 bg-space-deep-purple/20 rounded-lg"
                          >
                            <div className="mr-4">
                              <Badge
                                className={getDifficultyColor(
                                  item.level.difficulty
                                )}
                              >
                                {item.level.difficulty.charAt(0).toUpperCase() +
                                  item.level.difficulty.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {item.level.title}
                              </h4>
                              <p className="text-sm text-gray-400">
                                {item.level.category}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {item.is_completed ? (
                                  <span className="text-green-500">
                                    Completed
                                  </span>
                                ) : (
                                  <span className="text-yellow-500">
                                    In Progress
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                Score: {item.score}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        No levels attempted yet. Start a challenge to see your
                        progress!
                      </div>
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                  <Card className="cosmic-card p-6">
                    <h3 className="text-xl font-bold mb-4">
                      Coding Statistics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">
                          Challenge Completion
                        </h4>
                        <div className="space-y-2">
                          {["easy", "medium", "hard"].map((difficulty) => {
                            const { completed, total } =
                              calculateDifficultyCompletion(
                                difficulty as "easy" | "medium" | "hard"
                              );
                            const completionPercentage =
                              total > 0 ? (completed / total) * 100 : 0;

                            return (
                              <div key={difficulty}>
                                <div className="flex items-center justify-between text-sm">
                                  <span>
                                    {difficulty.charAt(0).toUpperCase() +
                                      difficulty.slice(1)}{" "}
                                    Challenges
                                  </span>
                                  <span>
                                    {completed}/{total}
                                  </span>
                                </div>
                                <Progress
                                  value={completionPercentage}
                                  className="h-1.5 bg-space-deep-purple/30"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Topic Mastery</h4>
                        <div className="space-y-2">
                          {categories.slice(0, 4).map((category, index) => {
                            const completion =
                              calculateCategoryCompletion(category);

                            return (
                              <div key={index}>
                                <div className="flex items-center justify-between text-sm">
                                  <span>{category}</span>
                                  <span>{completion}%</span>
                                </div>
                                <Progress
                                  value={completion}
                                  className="h-1.5 bg-space-deep-purple/30"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="cosmic-card p-6">
                    <h3 className="text-xl font-bold mb-4">Summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="flex flex-col items-center p-4 bg-space-deep-purple/20 rounded-lg">
                        <div className="text-2xl font-bold text-space-nebula mb-1">
                          {stats.total_completed_levels}
                        </div>
                        <span className="text-sm text-center text-gray-400">
                          Challenges Completed
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-4 bg-space-deep-purple/20 rounded-lg">
                        <div className="text-2xl font-bold text-space-neon-cyan mb-1">
                          {stats.total_attempts}
                        </div>
                        <span className="text-sm text-center text-gray-400">
                          Total Attempts
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-4 bg-space-deep-purple/20 rounded-lg">
                        <div className="text-2xl font-bold text-space-meteor-orange mb-1">
                          {stats.total_attempts > 0
                            ? Math.round(
                                (stats.total_completed_levels /
                                  stats.total_attempts) *
                                  100
                              )
                            : 0}
                          %
                        </div>
                        <span className="text-sm text-center text-gray-400">
                          Success Rate
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-4 bg-space-deep-purple/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-500 mb-1">
                          {Math.floor(stats.time_spent / 60)}h{" "}
                          {stats.time_spent % 60}m
                        </div>
                        <span className="text-sm text-center text-gray-400">
                          Time Invested
                        </span>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default Profile;
