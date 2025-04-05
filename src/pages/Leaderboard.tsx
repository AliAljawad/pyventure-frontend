
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import LeaderboardTable from '@/components/LeaderboardTable';

const Leaderboard = () => {
  // Update title
  useEffect(() => {
    document.title = "Leaderboard - PyVenture";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="glow-text">Leaderboard</span>
            </h1>
            <p className="text-xl text-gray-300">
              Explore the galaxy's top Python explorers and your ranking among the stars
            </p>
          </div>
          
          <LeaderboardTable />
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default Leaderboard;
