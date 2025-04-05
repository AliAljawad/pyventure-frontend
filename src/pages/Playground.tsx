
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import CodeEditor from '@/components/CodeEditor';
import PhaserGame from '@/components/PhaserGame';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const Playground = () => {
  // Update title
  useEffect(() => {
    document.title = "Code Playground - PyVenture";
  }, []);

  const [showCodeEditor, setShowCodeEditor] = useState(false);

  const handleReachCheckpoint = () => {
    toast.success("Checkpoint reached! Time to solve the coding challenge!", {
      duration: 5000,
    });
    
    // Show code editor after a short delay
    setTimeout(() => {
      setShowCodeEditor(true);
    }, 1500);
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
          
          {/* Game container */}
          <div className="cosmic-card mb-8 overflow-hidden">
            <div className="p-4 border-b border-space-nebula/20">
              <h2 className="text-xl font-bold text-white">Level 1: Syntax Galaxy</h2>
              <p className="text-gray-400">Reach the red checkpoint to unlock the challenge</p>
            </div>
            
            <div className="h-[600px] flex items-center justify-center bg-space-deep-purple/30">
              <PhaserGame onReachCheckpoint={handleReachCheckpoint} />
            </div>
          </div>
          
          {/* Dialog for code editor */}
          <Dialog open={showCodeEditor} onOpenChange={setShowCodeEditor}>
            <DialogContent className="max-w-4xl bg-space-dark-blue border-space-nebula/30">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">Python Challenge</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <CodeEditor />
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
