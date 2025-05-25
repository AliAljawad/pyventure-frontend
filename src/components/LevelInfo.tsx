import React from "react";
import { ArrowLeft, Info } from "lucide-react";
import { Level } from "./LevelSelect";

interface LevelInfoProps {
  level: Level;
  onBack: () => void;
  onStartLevel: () => void;
}

const LevelInfo = ({ level, onBack, onStartLevel }: LevelInfoProps) => {
  // Background gradients based on level theme
  const getThemeBackground = (theme: string) => {
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
      themes[theme as keyof typeof themes] || "from-blue-900 to-purple-900"
    );
  };

  // Difficulty information
  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return {
          color: "text-green-400",
          bgColor: "bg-green-400/20",
          description:
            "Perfect for those just starting with Python. Learn the fundamentals at a gentle pace.",
        };
      case "intermediate":
        return {
          color: "text-yellow-400",
          bgColor: "bg-yellow-400/20",
          description:
            "For coders with some Python experience. Introduces more complex concepts and challenges.",
        };
      case "advanced":
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
        {/* Banner image - simulated with gradient based on theme */}
        <div
          className={`h-32 bg-gradient-to-r ${getThemeBackground(
            level.theme
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
          {/* Difficulty badge */}
          <div
            className={`inline-block ${difficultyInfo.bgColor} ${difficultyInfo.color} px-3 py-1 rounded-full text-sm font-medium mb-4`}
          >
            {level.difficulty.charAt(0).toUpperCase() +
              level.difficulty.slice(1)}{" "}
            Difficulty
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
                Core Python concepts related to {level.title.toLowerCase()}
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-space-nebula rounded-full mr-2"></span>
                Problem-solving skills through interactive challenges
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-space-nebula rounded-full mr-2"></span>
                Practical coding applications in a game environment
              </li>
            </ul>
          </div>

          {/* Start button */}
          <button
            onClick={onStartLevel}
            className="w-full py-3 px-6 bg-space-nebula text-white font-medium rounded-md hover:bg-space-nebula/80 transition-colors focus:outline-none focus:ring-2 focus:ring-space-nebula focus:ring-opacity-50"
          >
            Start Level
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelInfo;
