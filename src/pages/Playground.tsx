import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import CodeEditor from "@/components/CodeEditor";
import PhaserGame from "@/components/PhaserGame";
import LevelSelect, { Level } from "@/components/levelSelect";
import LevelInfo from "@/components/LevelInfo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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
    // More levels initialized in LevelSelect component
  ]);

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

    // Update level progress (in a real app, you'd save this to storage/database)
    setLevels((prevLevels) =>
      prevLevels.map((level) => {
        if (level.id === selectedLevel) {
          return { ...level, isCompleted: true, stars: 2 };
        } else if (level.id === selectedLevel + 1) {
          return { ...level, isUnlocked: true };
        }
        return level;
      })
    );
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
              <LevelSelect onSelectLevel={handleSelectLevel} />
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
                  className="text-gray-300 hover:text-white flex items-center"
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
            <DialogContent className="max-w-4xl bg-space-dark-blue border-space-nebula/30">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">
                  Python Challenge - Level {selectedLevel}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <CodeEditor />
              </div>
              <div className="flex justify-end space-x-3 mt-2">
                <button
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                  onClick={handleCodeEditorClose}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-space-nebula text-white rounded hover:bg-space-nebula/80"
                  onClick={handleCodeEditorClose}
                >
                  Submit & Continue
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
