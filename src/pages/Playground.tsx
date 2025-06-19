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
  const getAuthToken = (): string | null => {
    try {
      const token = localStorage.getItem("token");
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };  
  // Initialize auth token immediately with the value, not null first
  const [authToken, setAuthToken] = useState<string | null>(() => {
    // Initialize with the actual token value on first render
    return getAuthToken();
  });


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
      // Update backend with completion
      await apiService.backend.updateUserProgress(levelId, score);

      // Show success message
      toast.success("Level completed successfully!", {
        description: `Great job! Level ${levelId + 1} might now be unlocked.`,
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

  // Get selected level data for display
  const getSelectedLevelTitle = () => {
    // This will be fetched by LevelInfo component, so we just show the level number
    return `Level ${selectedLevel}`;
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
              <LevelSelect
                onSelectLevel={handleSelectLevel}
                apiBaseUrl="http://127.0.0.1:8000/api"
                authToken={authToken}
              />
            </div>
          )}

          {gameState === "level-info" && (
            <LevelInfo
              levelId={selectedLevel}
              onBack={handleBackToLevels}
              onStartLevel={handleStartLevel}
              apiBaseUrl="http://127.0.0.1:8000/api"
              authToken={authToken}
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
                <div className="text-gray-300">{getSelectedLevelTitle()}</div>
              </div>

              {/* Game container */}
              <div className="cosmic-card mb-8 overflow-hidden">
                <div className="p-4 border-b border-space-nebula/20">
                  <h2 className="text-xl font-bold text-white">
                    {getSelectedLevelTitle()}
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
