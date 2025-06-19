import { useState, useEffect } from "react";
import { ChevronRight, Lock, Check, Loader2 } from "lucide-react";

export interface Level {
  id: number;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  topic: string;
  is_unlocked: boolean;
  is_completed: boolean;
}

export interface UserProgress {
  user_id: number;
  level_id: number;
  is_completed: boolean;
  score: number;
  attempts: number;
  last_updated: string;
}

export interface LevelSelectProps {
  onSelectLevel: (level: Level) => void;
  apiBaseUrl?: string;
  authToken?: string; // Pass auth token as prop instead of using localStorage
}

const LevelSelect = ({
  onSelectLevel,
  apiBaseUrl = "http://127.0.0.1:8000/api",
  authToken,
}: LevelSelectProps) => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to process levels based on user progress
  const processLevelsWithProgress = (
    fetchedLevels: Level[],
    progress: UserProgress[]
  ): Level[] => {
    // Find the highest completed level
    const completedLevels = progress
      .filter((p) => p.is_completed)
      .map((p) => p.level_id)
      .sort((a, b) => b - a); // Sort in descending order

    const highestCompletedLevel =
      completedLevels.length > 0 ? completedLevels[0] : 0;

    // Process each level
    return fetchedLevels.map((level) => {
      const userProgressForLevel = progress.find(
        (p) => p.level_id === level.id
      );

      // Check if level should be unlocked
      const shouldBeUnlocked = level.id <= highestCompletedLevel + 1;

      // Check if level should be completed
      const shouldBeCompleted = level.id <= highestCompletedLevel;

      return {
        ...level,
        is_unlocked: shouldBeUnlocked || level.id === 1, // Always unlock level 1
        is_completed:
          shouldBeCompleted || userProgressForLevel?.is_completed || false,
      };
    });
  };

  // Fetch levels and user progress from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        // Add authorization header if token is provided
        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }

        // Fetch levels and progress simultaneously
        const [levelsResponse, progressResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/levels`, {
            method: "GET",
            headers,
          }),
          // Only fetch progress if user is authenticated
          authToken
            ? fetch(`${apiBaseUrl}/profile`, {
                method: "GET",
                headers,
              })
            : Promise.resolve(null),
        ]);

        // Handle levels response
        if (!levelsResponse.ok) {
          throw new Error(`HTTP error! status: ${levelsResponse.status}`);
        }

        const levelsResult = await levelsResponse.json();
        if (!levelsResult.success) {
          throw new Error(levelsResult.message || "Failed to fetch levels");
        }

        const fetchedLevels = levelsResult.data;
        let userProgressData: UserProgress[] = [];

        // Handle progress response if user is authenticated
        if (progressResponse && progressResponse.ok) {
          const progressResult = await progressResponse.json();
          if (progressResult.progress) {
            userProgressData = progressResult.progress;
            setUserProgress(userProgressData);
          }
        }

        // Process levels with progress data
        const processedLevels = authToken
          ? processLevelsWithProgress(fetchedLevels, userProgressData)
          : fetchedLevels.map((level: Level, index: number) => ({
              ...level,
              is_unlocked: index === 0, // Only unlock first level for non-authenticated users
              is_completed: false,
            }));

        setLevels(processedLevels);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiBaseUrl, authToken]);

  // Function to get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-red-400";
      default:
        return "text-blue-400";
    }
  };

  // Get progress statistics
  const getProgressStats = () => {
    const totalLevels = levels.length;
    const completedLevels = levels.filter((level) => level.is_completed).length;
    const unlockedLevels = levels.filter((level) => level.is_unlocked).length;

    return {
      total: totalLevels,
      completed: completedLevels,
      unlocked: unlockedLevels,
      completionPercentage:
        totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0,
    };
  };

  const progressStats = getProgressStats();

  // Loading state
  if (loading) {
    return (
      <div className="py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-space-nebula animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading levels...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-8">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 mb-6">
          <h3 className="text-red-400 font-medium mb-2">
            Error Loading Levels
          </h3>
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Select a Level</h2>

        {/* Progress Summary - only show if user is authenticated */}
        {authToken && (
          <div className="bg-space-deep-purple/20 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-space-nebula">
                    {progressStats.completed}
                  </div>
                  <div className="text-sm text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-space-neon-cyan">
                    {progressStats.unlocked}
                  </div>
                  <div className="text-sm text-gray-400">Unlocked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {progressStats.total}
                  </div>
                  <div className="text-sm text-gray-400">Total</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-space-meteor-orange">
                  {progressStats.completionPercentage}%
                </div>
                <div className="text-sm text-gray-400">Progress</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((level) => (
          <div
            key={level.id}
            className={`cosmic-card relative overflow-hidden transition-all duration-300 ${
              level.is_unlocked
                ? "cursor-pointer hover:scale-105 hover:shadow-glow"
                : "opacity-70 grayscale cursor-not-allowed"
            }`}
            onClick={() => level.is_unlocked && onSelectLevel(level)}
          >
            {/* Path connector lines (visually connect levels) */}
            {level.id < levels.length && (
              <div className="absolute -right-4 top-1/2 w-8 h-1 bg-space-nebula z-0 hidden md:block"></div>
            )}

            {/* Level content */}
            <div className="p-5 relative z-10">
              {/* Header with level number and completion status */}
              <div className="flex justify-between items-center mb-3">
                <span className="bg-space-dark-blue/80 text-white px-3 py-1 rounded-full text-sm">
                  Level {level.id}
                </span>

                {level.is_completed ? (
                  <span className="bg-green-600/30 text-green-400 px-2 py-1 rounded-full text-xs flex items-center">
                    <Check className="w-3 h-3 mr-1" /> Completed
                  </span>
                ) : level.is_unlocked ? (
                  <span className="bg-blue-600/30 text-blue-400 px-2 py-1 rounded-full text-xs">
                    Unlocked
                  </span>
                ) : (
                  <span className="bg-gray-800/50 text-gray-400 px-2 py-1 rounded-full text-xs flex items-center">
                    <Lock className="w-3 h-3 mr-1" /> Locked
                  </span>
                )}
              </div>

              {/* Level title and topic */}
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-glow">
                {level.title}
              </h3>

              {/* Topic badge */}
              <div className="mb-2">
                <span className="bg-space-nebula/30 text-space-nebula px-2 py-1 rounded-full text-xs">
                  {level.topic?.charAt(0).toUpperCase() + level.topic?.slice(1)}
                </span>
              </div>

              {/* Difficulty */}
              <p
                className={`text-sm mb-3 ${getDifficultyColor(
                  level.difficulty
                )}`}
              >
                {level.difficulty.charAt(0).toUpperCase() +
                  level.difficulty.slice(1)}{" "}
                Difficulty
              </p>

              {/* Description */}
              <p className="text-gray-300 text-sm mb-4">{level.description}</p>

              {/* Bottom section with progress info and button */}
              <div className="flex justify-between items-center mt-2">
                {/* Show user's progress for this level if available */}
                {authToken && userProgress.length > 0 && (
                  <div className="text-xs text-gray-400">
                    {(() => {
                      const progress = userProgress.find(
                        (p) => p.level_id === level.id
                      );
                      if (progress) {
                        return `Score: ${progress.score} | Attempts: ${progress.attempts}`;
                      }
                      return "";
                    })()}
                  </div>
                )}

                <button
                  className={`flex items-center text-sm px-3 py-1 rounded-full 
                    ${
                      level.is_unlocked
                        ? "bg-space-nebula/30 text-space-nebula hover:bg-space-nebula/50"
                        : "bg-gray-800/50 text-gray-500"
                    }`}
                  disabled={!level.is_unlocked}
                >
                  {level.is_completed ? "Replay" : "Play"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Lock overlay for locked levels */}
            {!level.is_unlocked && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Lock className="w-12 h-12 text-gray-400 opacity-80" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LevelSelect;
