
import { useState, useEffect } from 'react';
import { ChevronRight, Rocket, Code, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const navigate = useNavigate();
  
  // Create star field effect
  useEffect(() => {
    const starField = document.querySelector('.star-field');
    if (!starField) return;
    
    // Clear existing stars first
    starField.innerHTML = '';
    
    // Generate random stars
    const numStars = 100;
    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      star.classList.add('star');
      
      // Random position
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      
      // Random size
      const size = Math.random() * 2 + 1;
      
      // Random twinkle animation delay
      const delay = Math.random() * 5;
      
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.animationDelay = `${delay}s`;
      
      // Add animation class to some stars
      if (Math.random() > 0.7) {
        star.classList.add('animate-star-twinkle');
      }
      
      starField.appendChild(star);
    }
  }, []);

  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center pt-16 pb-24 px-4 sm:px-6 lg:px-8">
      {/* Star field background */}
      <div className="star-field" />
      
      {/* Floating planet graphics */}
      <div className="absolute top-1/4 left-10 w-24 h-24 rounded-full bg-gradient-to-br from-space-meteor-orange to-red-500 opacity-30 blur-xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/3 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-space-nebula to-space-neon-purple opacity-20 blur-xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
          <span className="block glow-text">Master Python</span>
          <span className="block text-white">Through Adventure</span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
          Embark on an interstellar journey to learn Python programming through
          interactive challenges, AI-powered feedback, and cosmic rewards.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/playground')}
            className="cosmic-button group text-lg px-8 py-3"
          >
            Start Learning
            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            onClick={() => navigate('/leaderboard')}
            variant="outline"
            className="border-space-nebula text-space-nebula hover:bg-space-nebula/10 text-lg px-8 py-3"
          >
            View Leaderboard
          </Button>
          
          <Button 
            onClick={() => navigate('/login')}
            variant="outline" 
            className="border-space-neon-cyan text-space-neon-cyan hover:bg-space-neon-cyan/10 text-lg px-8 py-3"
          >
            Join Now
          </Button>
        </div>
      </div>
      
      {/* Floating badge indicators */}
      <div className="absolute bottom-10 left-10 hidden lg:block">
        <div className="flex items-center space-x-2 bg-space-dark-blue/60 backdrop-blur-sm px-4 py-2 rounded-full border border-space-nebula/20">
          <Rocket className="h-5 w-5 text-space-neon-pink" />
          <span className="text-space-neon-pink text-sm">50+ Challenges</span>
        </div>
      </div>
      
      <div className="absolute bottom-10 right-10 hidden lg:block">
        <div className="flex items-center space-x-2 bg-space-dark-blue/60 backdrop-blur-sm px-4 py-2 rounded-full border border-space-nebula/20">
          <Code className="h-5 w-5 text-space-neon-cyan" />
          <span className="text-space-neon-cyan text-sm">AI-Powered</span>
        </div>
      </div>
      
      <div className="absolute top-40 right-10 hidden lg:block">
        <div className="flex items-center space-x-2 bg-space-dark-blue/60 backdrop-blur-sm px-4 py-2 rounded-full border border-space-nebula/20">
          <Brain className="h-5 w-5 text-space-meteor-orange" />
          <span className="text-space-meteor-orange text-sm">Adaptive Learning</span>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
