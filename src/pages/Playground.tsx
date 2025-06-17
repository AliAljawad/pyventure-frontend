import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import CodeEditor from "@/components/CodeEditor";
import PhaserGame from "@/components/PhaserGame";
import LevelSelect, { Level } from "@/components/LevelSelect";
import LevelInfo from "@/components/LevelInfo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import apiService from "@/api/code-editor";

// Game states
type GameState = "level-select" | "level-info" | "playing";

const Playground = () => {
  // Update title
  useEffect(() => {
    document.title = "Code Playground - PyVenture";
  }, []);

  // Game state
  const [gameState, setGameState] = useState<GameState>("level-select");
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  // Mock level data - in a real app, this would come from a database or local storage
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
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
    },
    {
      id: 3,
      title: "Conditional Cosmos",
      description: "Navigate through space using if/else statements",
      difficulty: "beginner",
      theme: "cosmic",
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
    },
    {
      id: 4,
      title: "Loop Laboratory",
      description: "Master loops in the space laboratory",
      difficulty: "intermediate",
      theme: "lab",
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
    },
    {
      id: 5,
      title: "Function Fortress",
      description: "Build functions in the cosmic fortress",
      difficulty: "intermediate",
      theme: "fortress",
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
    },
    {
      id: 6,
      title: "Data Structure Dimension",
      description: "Explore lists and dictionaries in another dimension",
      difficulty: "intermediate",
      theme: "dimension",
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
    },
    {
      id: 7,
      title: "String Solar System",
      description: "Manipulate strings across the solar system",
      difficulty: "advanced",
      theme: "solar",
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
    },
    {
      id: 8,
      title: "Error Handling Enterprise",
      description: "Handle errors aboard the space enterprise",
      difficulty: "advanced",
      theme: "enterprise",
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
    },
  ]);

  // Load user progress on component mount
  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      const progress = await apiService.backend.getUserProgress();
      // Update levels based on user progress
      setLevels((prevLevels) =>
        prevLevels.map((level) => {
          const userProgress = progress.find((p) => p.level_id === level.id);
          if (userProgress) {
            return {
              ...level,
              isCompleted: userProgress.is_completed,
              stars: Math.floor(userProgress.score / 34), // Convert score to stars (0-3)
              isUnlocked: true, // If user has progress, level is unlocked
            };
          }
          return level;
        })
      );
    } catch (error) {
      console.error("Failed to load user progress:", error);
      // Continue with default levels if progress can't be loaded
    }
  };

  // Handle level selection
  const handleSelectLevel = (levelId: number) => {
    setSelectedLevel(levelId);
    setGameState("level-info");
  };

  // Handle starting a level
  const handleStartLevel = () => {
    setGameState("playing");
  };

  // Handle back to level selection
  const handleBackToLevels = () => {
    setGameState("level-select");
    setShowCodeEditor(false);
  };

  // Handle checkpoint reached
  const handleReachCheckpoint = () => {
    toast.success("Checkpoint reached! Time to solve the coding challenge!", {
      duration: 5000,
    });

    // Show code editor after a short delay
    setTimeout(() => {
      setShowCodeEditor(true);
    }, 1500);
  };

  // Handle level completion from CodeEditor
  const handleLevelComplete = async (levelId: number, score: number) => {
    try {
      // Update local state
      setLevels((prevLevels) =>
        prevLevels.map((level) => {
          if (level.id === levelId) {
            return {
              ...level,
              isCompleted: true,
              stars: Math.floor(score / 34), // Convert score to stars
            };
          } else if (level.id === levelId + 1) {
            return { ...level, isUnlocked: true };
          }
          return level;
        })
      );

      // Show success message
      toast.success("Level completed successfully!", {
        description: `Great job! Level ${levelId + 1} is now unlocked.`,
        duration: 5000,
      });

      // Close code editor and return to level select after a delay
      setTimeout(() => {
        setShowCodeEditor(false);
        setTimeout(() => {
          setGameState("level-select");
        }, 500);
      }, 2000);
    } catch (error) {
      console.error("Failed to complete level:", error);
      toast.error("Failed to save progress", {
        description: "Your solution was correct but couldn't be saved.",
      });
    }
  };

  // Handle code editor close - return to level selection
  const handleCodeEditorClose = () => {
    setShowCodeEditor(false);
    setTimeout(() => {
      setGameState("level-select");
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="glow-text">Python Adventure</span>
            </h1>
            <p className="text-xl text-gray-300">
              Navigate through the game world and unlock coding challenges
            </p>
          </div>

          {gameState === "level-select" && (
            <div>
              <LevelSelect levels={levels} onSelectLevel={handleSelectLevel} />
            </div>
          )}

          {gameState === "level-info" && (
            <LevelInfo
              level={levels.find((l) => l.id === selectedLevel) || levels[0]}
              onBack={handleBackToLevels}
              onStartLevel={handleStartLevel}
            />
          )}

          {gameState === "playing" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handleBackToLevels}
                  className="text-gray-300 hover:text-white flex items-center transition-colors"
                >
                  <span className="mr-2">←</span> Back to Levels
                </button>
                <div className="text-gray-300">
                  Level {selectedLevel}:{" "}
                  {levels.find((l) => l.id === selectedLevel)?.title}
                </div>
              </div>

              {/* Game container */}
              <div className="cosmic-card mb-8 overflow-hidden">
                <div className="p-4 border-b border-space-nebula/20">
                  <h2 className="text-xl font-bold text-white">
                    Level {selectedLevel}:{" "}
                    {levels.find((l) => l.id === selectedLevel)?.title}
                  </h2>
                  <p className="text-gray-400">
                    Reach the red checkpoint to unlock the challenge
                  </p>
                </div>

                <div className="h-[600px] flex items-center justify-center bg-space-deep-purple/30">
                  <PhaserGame
                    onReachCheckpoint={handleReachCheckpoint}
                    level={selectedLevel}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dialog for code editor */}
          <Dialog open={showCodeEditor} onOpenChange={setShowCodeEditor}>
            <DialogContent className="max-w-6xl bg-space-dark-blue border-space-nebula/30">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">
                  Python Challenge - Level {selectedLevel}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <CodeEditor
                  levelId={selectedLevel}
                  onLevelComplete={handleLevelComplete}
                  onClose={handleCodeEditorClose}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-2">
                <button
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                  onClick={handleCodeEditorClose}
                >
                  Close
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default Playground;
