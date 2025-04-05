
import { Heart, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const FooterSection = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-space-dark-blue border-t border-space-nebula/20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-space-nebula to-space-neon-cyan flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-xl font-bold text-white">PyVenture</span>
            </Link>
            <p className="mt-4 text-gray-400">
              Explore the universe of Python through interactive, gamified learning experiences.
            </p>
          </div>
          
          {/* Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-medium text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-space-nebula transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/playground" className="text-gray-400 hover:text-space-nebula transition-colors">
                  Playground
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-gray-400 hover:text-space-nebula transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-space-nebula transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-medium text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-space-nebula transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-space-nebula transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-space-nebula transition-colors">
                  Community Forums
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-space-nebula transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-medium text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-space-nebula transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-space-nebula transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-space-nebula transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-space-nebula transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-space-nebula/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} PyVenture. All rights reserved.
          </p>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-space-nebula">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-space-nebula">
              <span className="sr-only">GitHub</span>
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-space-nebula">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs mt-2">
            PyVenture is committed to accessibility and inclusive learning for all.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
