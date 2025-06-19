import { useState, useEffect } from "react";
import { ArrowLeft, Check, Info, Loader2 } from "lucide-react";
import { Level } from "./LevelSelect";

interface LevelInfoProps {
  levelId: number;
  onBack: () => void;
  onStartLevel: () => void;
  apiBaseUrl?: string;
  authToken?: string; // Pass auth token as prop instead of using localStorage
}

const LevelInfo = ({
  levelId,
  onBack,
  onStartLevel,
  apiBaseUrl = "http://127.0.0.1:8000/api",
  authToken,
}: LevelInfoProps) => {
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch individual level data from API
  useEffect(() => {
    const fetchLevel = async () => {
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

        const response = await fetch(`${apiBaseUrl}/levels/${levelId}`, {
          method: "GET",
          headers,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setLevel(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch level details");
        }
      } catch (err) {
        console.error("Error fetching level:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch level details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (levelId) {
      fetchLevel();
    }
  }, [levelId, apiBaseUrl, authToken]);

  // Background gradients based on level category
  const getThemeBackground = (category: string) => {
    const themes = {
      space: "from-indigo-900 to-purple-900",
      nebula: "from-purple-900 to-pink-800",
      cosmos: "from-blue-900 to-indigo-900",
      moon: "from-gray-800 to-gray-900",
      frontier: "from-green-900 to-teal-900",
      labyrinth: "from-yellow-900 to-orange-900",
      dimension: "from-red-900 to-pink-900",
      constellation: "from-blue-900 to-cyan-900",
      eclipse: "from-purple-900 to-gray-900",
      mothership: "from-green-900 to-cyan-900",
    };

    return (
      themes[category as keyof typeof themes] || "from-blue-900 to-purple-900"
    );
  };

  // Difficulty information
  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return {
          color: "text-green-400",
          bgColor: "bg-green-400/20",
          description:
            "Perfect for those just starting with Python. Learn the fundamentals at a gentle pace.",
        };
      case "medium":
        return {
          color: "text-yellow-400",
          bgColor: "bg-yellow-400/20",
          description:
            "For coders with some Python experience. Introduces more complex concepts and challenges.",
        };
      case "hard":
        return {
          color: "text-red-400",
          bgColor: "bg-red-400/20",
          description:
            "Challenging content for experienced Python developers. Prepare for complex puzzles and advanced concepts.",
        };
      default:
        return {
          color: "text-blue-400",
          bgColor: "bg-blue-400/20",
          description: "Standard difficulty level with balanced challenges.",
        };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Levels
          </button>
        </div>

        <div className="cosmic-card p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-space-nebula animate-spin mx-auto mb-4" />
              <p className="text-gray-300">Loading level details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !level) {
    return (
      <div className="w-full">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Levels
          </button>
        </div>

        <div className="cosmic-card p-6">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
            <h3 className="text-red-400 font-medium mb-2">
              Error Loading Level
            </h3>
            <p className="text-red-300 text-sm">{error || "Level not found"}</p>
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const difficultyInfo = getDifficultyInfo(level.difficulty);

  return (
    <div className="w-full">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Levels
        </button>
      </div>

      {/* Level card with detailed info */}
      <div className={`cosmic-card overflow-hidden`}>
        {/* Banner image - simulated with gradient based on category */}
        <div
          className={`h-32 bg-gradient-to-r ${getThemeBackground(
            level.category
          )} relative`}
        >
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute bottom-4 left-6">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              Level {level.id}: {level.title}
            </h2>
          </div>
        </div>

        {/* Level information */}
        <div className="p-6">
          {/* Topic and Difficulty badges */}
          <div className="flex gap-2 mb-4">
            <span className="bg-space-nebula/30 text-space-nebula px-3 py-1 rounded-full text-sm">
              {level.topic?.charAt(0).toUpperCase() + level.topic?.slice(1)}
            </span>
            <span
              className={`${difficultyInfo.bgColor} ${difficultyInfo.color} px-3 py-1 rounded-full text-sm font-medium`}
            >
              {level.difficulty.charAt(0).toUpperCase() +
                level.difficulty.slice(1)}{" "}
              Difficulty
            </span>
          </div>

          {/* Main description */}
          <p className="text-gray-200 text-lg mb-6">{level.description}</p>

          {/* Detailed difficulty info */}
          <div className="mb-6 flex items-start space-x-3 bg-space-deep-purple/30 p-4 rounded-lg">
            <Info className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className={`${difficultyInfo.color} font-medium mb-1`}>
                Difficulty Information
              </h3>
              <p className="text-gray-300 text-sm">
                {difficultyInfo.description}
              </p>
            </div>
          </div>

          {/* What you'll learn */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-2">What You'll Learn</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-space-nebula rounded-full mr-2"></span>
                Core Python concepts related to {level.topic}
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-space-nebula rounded-full mr-2"></span>
                Problem-solving skills through interactive challenges
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-space-nebula rounded-full mr-2"></span>
                Practical coding applications in a {level.category} environment
              </li>
            </ul>
          </div>

          {/* Level status */}
            {level.is_completed ? (
            <div className="mb-4 flex items-center text-green-400">
              <Check className="w-5 h-5 mr-2" />
              <span>You've completed this level!</span>
            </div>
            ) : null}

          {/* Start button */}
          <button
            onClick={onStartLevel}
            disabled={!level.is_unlocked}
            className={`w-full py-3 px-6 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
              level.is_unlocked
                ? "bg-space-nebula text-white hover:bg-space-nebula/80 focus:ring-space-nebula"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {level.is_completed ? "Play Again" : "Start Level"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelInfo;
