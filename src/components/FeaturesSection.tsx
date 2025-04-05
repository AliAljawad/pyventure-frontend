
import { Gamepad2, Zap, Gauge, Trophy, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FeaturesSection = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: <Gamepad2 className="h-10 w-10 text-space-neon-pink" />,
      title: "Gamified Learning",
      description: "Explore planets, solve coding puzzles, and collect cosmic rewards as you master Python fundamentals through interactive gameplay.",
      color: "from-space-neon-pink to-purple-500"
    },
    {
      icon: <Zap className="h-10 w-10 text-space-neon-cyan" />,
      title: "AI-Driven Feedback",
      description: "Receive real-time code analysis and personalized guidance from our AI assistant to help you improve your programming skills.",
      color: "from-space-neon-cyan to-blue-500"
    },
    {
      icon: <Gauge className="h-10 w-10 text-space-meteor-orange" />,
      title: "Adaptive Difficulty",
      description: "Challenge yourself with our intelligent system that adjusts task complexity based on your skill level and learning progress.",
      color: "from-space-meteor-orange to-yellow-500"
    },
    {
      icon: <Trophy className="h-10 w-10 text-space-nebula" />,
      title: "Compete Globally",
      description: "Join a community of learners, climb the ranks on our global leaderboards, and earn achievements for your coding prowess.",
      color: "from-space-nebula to-indigo-500"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="glow-text">Supercharge</span> Your Python Journey
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            PyVenture combines cutting-edge technology with proven learning methodologies to make coding fun and effective.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="cosmic-card overflow-hidden">
              <CardHeader className="pb-2">
                <div className="mb-4 p-3 w-16 h-16 rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center"
                  style={{ background: `linear-gradient(to bottom right, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})` }}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-bold text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-10">How It Works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-space-deep-purple flex items-center justify-center mb-4 border border-space-nebula/30 shadow-lg shadow-space-nebula/20">
                <span className="text-xl font-bold">1</span>
              </div>
              <h4 className="text-xl font-medium mb-2">Choose a Challenge</h4>
              <p className="text-gray-300 text-center">Select from our library of Python challenges across various difficulty levels.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-space-deep-purple flex items-center justify-center mb-4 border border-space-nebula/30 shadow-lg shadow-space-nebula/20">
                <span className="text-xl font-bold">2</span>
              </div>
              <h4 className="text-xl font-medium mb-2">Code in Phaser.js</h4>
              <p className="text-gray-300 text-center">Write Python code to solve puzzles in our interactive Phaser.js environment.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-space-deep-purple flex items-center justify-center mb-4 border border-space-nebula/30 shadow-lg shadow-space-nebula/20">
                <span className="text-xl font-bold">3</span>
              </div>
              <h4 className="text-xl font-medium mb-2">Earn Rewards</h4>
              <p className="text-gray-300 text-center">Gain points, unlock achievements, and advance through the cosmic ranking system.</p>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/playground')} 
            className="mt-12 cosmic-button group"
          >
            Try a Challenge Now
            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
