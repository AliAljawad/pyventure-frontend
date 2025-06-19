import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X, User, Award, Terminal, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext"; // Import the auth context

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Use the auth context instead of local state
  const { isAuthenticated, logout } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navigateTo = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    // Use the logout function from AuthContext
    logout();

    // Navigate to home page
    navigateTo("/");

    // You can also call a logout API endpoint here if needed
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-space-dark-blue/80 border-b border-space-nebula/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-space-nebula to-space-neon-cyan flex items-center justify-center">
                  <Terminal className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">PyVenture</span>
              </Link>
            </div>
          </div>

          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <Button
              variant="ghost"
              className="text-gray-200 hover:text-white"
              onClick={() => navigateTo("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              variant="ghost"
              className="text-gray-200 hover:text-white"
              onClick={() => navigateTo("/leaderboard")}
            >
              <Award className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
            <Button
              variant="ghost"
              className="text-gray-200 hover:text-white"
              onClick={() => navigateTo("/playground")}
            >
              <Terminal className="w-4 h-4 mr-2" />
              Playground
            </Button>

            {/* Conditionally render Profile button */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                className="text-gray-200 hover:text-white"
                onClick={() => navigateTo("/profile")}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            )}

            {/* Conditionally render Login/Logout button */}
            {isAuthenticated ? (
              <Button
                className="ml-4 cosmic-button bg-red-600 hover:bg-red-700"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button
                className="ml-4 cosmic-button"
                onClick={() => navigateTo("/login")}
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("md:hidden", isOpen ? "block" : "hidden")}>
        <div className="pt-2 pb-3 space-y-1 px-4 sm:px-6 lg:px-8 border-t border-space-nebula/20">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-200 hover:text-white"
            onClick={() => navigateTo("/")}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-200 hover:text-white"
            onClick={() => navigateTo("/leaderboard")}
          >
            <Award className="w-4 h-4 mr-2" />
            Leaderboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-200 hover:text-white"
            onClick={() => navigateTo("/playground")}
          >
            <Terminal className="w-4 h-4 mr-2" />
            Playground
          </Button>

          {/* Conditionally render Profile button in mobile menu */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-200 hover:text-white"
              onClick={() => navigateTo("/profile")}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          )}

          {/* Conditionally render Login/Logout button in mobile menu */}
          {isAuthenticated ? (
            <Button
              className="w-full mt-4 cosmic-button bg-red-600 hover:bg-red-700"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          ) : (
            <Button
              className="w-full mt-4 cosmic-button"
              onClick={() => navigateTo("/login")}
            >
              <User className="w-4 h-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
