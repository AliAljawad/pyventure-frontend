import { useState } from "react";
import { ChevronRight, Lock, Check, Star } from "lucide-react";

export interface Level {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  theme: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  stars: number;
}

export interface LevelSelectProps {
  levels: Level[];
  onSelectLevel: (levelId: number) => void;
}

const LevelSelect = ({ onSelectLevel }: LevelSelectProps) => {
  // In a real app, this would come from a database or local storage
  const [levels, setLevels] = useState<Level[]>([
    {
      id: 1,
      title: "Syntax Galaxy",
      description:
        "Learn the basics of Python syntax while exploring the galaxy",
      difficulty: "beginner",
      theme: "space",
      isUnlocked: true,
      isCompleted: false,
      stars: 0,
    },
    {
      id: 2,
      title: "Variable Nebula",
      description: "Master variables and data types in the colorful nebula",
      difficulty: "beginner",
      theme: "nebula",
      isUnlocked: true,
      isCompleted: false,
      stars: 0,
    },
    {
      id: 3,
      title: "Conditional Cosmos",
      description: "Navigate through if statements and logical operators",
      difficulty: "beginner",
      theme: "cosmos",
      isUnlocked: true,
      isCompleted: false,
      stars: 0,
    },
    {
      id: 4,
      title: "Loop Lunar Base",
      description: "Master loops and iterations on the lunar surface",
      difficulty: "intermediate",
      theme: "moon",
      isUnlocked: true,
      isCompleted: false,
      stars: 0,
    },
    {
      id: 5,
      title: "Function Frontier",
      description: "Create and use functions to solve complex problems",
      difficulty: "intermediate",
      theme: "frontier",
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
    },
    {
      id: 6,
      title: "List Labyrinth",
      description: "Navigate the maze of lists and their methods",
      difficulty: "intermediate",
      theme: "labyrinth",
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
    },
    {
      id: 7,
      title: "Dictionary Dimension",
      description: "Explore dictionaries in a multi-dimensional space",
      difficulty: "intermediate",
      theme: "dimension",
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
    },
    {
      id: 8,
      title: "Class Constellation",
      description: "Build classes and objects in the star constellation",
      difficulty: "advanced",
      theme: "constellation",
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
    },
    {
      id: 9,
      title: "Exception Eclipse",
      description: "Handle exceptions during the cosmic eclipse",
      difficulty: "advanced",
      theme: "eclipse",
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
    },
    {
      id: 10,
      title: "Module Mothership",
      description: "Import and use modules in the ultimate mothership",
      difficulty: "advanced",
      theme: "mothership",
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
    },
  ]);

  // Function to get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-400";
      case "intermediate":
        return "text-yellow-400";
      case "advanced":
        return "text-red-400";
      default:
        return "text-blue-400";
    }
  };

  // Function to render stars
  const renderStars = (count: number) => {
    return Array(3)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
          }`}
        />
      ));
  };

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Select a Level</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((level) => (
          <div
            key={level.id}
            className={`cosmic-card relative overflow-hidden transition-all duration-300 ${
              level.isUnlocked
                ? "cursor-pointer hover:scale-105 hover:shadow-glow"
                : "opacity-70 grayscale cursor-not-allowed"
            }`}
            onClick={() => level.isUnlocked && onSelectLevel(level.id)}
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

                {level.isCompleted ? (
                  <span className="bg-green-600/30 text-green-400 px-2 py-1 rounded-full text-xs flex items-center">
                    <Check className="w-3 h-3 mr-1" /> Completed
                  </span>
                ) : level.isUnlocked ? (
                  <span className="bg-blue-600/30 text-blue-400 px-2 py-1 rounded-full text-xs">
                    Unlocked
                  </span>
                ) : (
                  <span className="bg-gray-800/50 text-gray-400 px-2 py-1 rounded-full text-xs flex items-center">
                    <Lock className="w-3 h-3 mr-1" /> Locked
                  </span>
                )}
              </div>

              {/* Level title and theme */}
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-glow">
                {level.title}
              </h3>

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

              {/* Bottom section with stars and button */}
              <div className="flex justify-between items-center mt-2">
                <div className="flex">{renderStars(level.stars)}</div>

                <button
                  className={`flex items-center text-sm px-3 py-1 rounded-full 
                    ${
                      level.isUnlocked
                        ? "bg-space-nebula/30 text-space-nebula hover:bg-space-nebula/50"
                        : "bg-gray-800/50 text-gray-500"
                    }`}
                  disabled={!level.isUnlocked}
                >
                  Play <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Lock overlay for locked levels */}
            {!level.isUnlocked && (
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
