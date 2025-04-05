
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Update title
  useEffect(() => {
    document.title = "Login - PyVenture";
  }, []);
  
  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Login successful!", {
        description: "Welcome back to PyVenture!",
        icon: <CheckCircle className="text-green-500" />,
      });
      navigate('/playground');
    }, 1500);
  };
  
  const handleSignup = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Account created successfully!", {
        description: "Welcome to PyVenture! Get ready to start your adventure.",
        icon: <CheckCircle className="text-green-500" />,
      });
      navigate('/playground');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Star field decoration elements */}
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-space-nebula to-space-neon-purple opacity-10 blur-3xl -z-10" />
          
          <Card className="cosmic-card shadow-xl border-space-nebula/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Welcome to <span className="glow-text">PyVenture</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Log in or create an account to start your coding adventure
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        placeholder="youremail@example.com" 
                        type="email" 
                        required
                        className="bg-space-deep-purple/20 border-space-nebula/30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <a href="#" className="text-sm text-space-nebula hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <Input 
                        id="password" 
                        type="password" 
                        required
                        className="bg-space-deep-purple/20 border-space-nebula/30"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label htmlFor="remember" className="text-sm text-gray-400">Remember me</Label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="cosmic-button w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                          Logging in...
                        </>
                      ) : (
                        <>
                          Login
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                    
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-space-nebula/20"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-card text-gray-400">or continue with</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="border-space-nebula/30 hover:bg-space-nebula/10"
                      >
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="border-space-nebula/30 hover:bg-space-nebula/10"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Google
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-username">Username</Label>
                      <Input 
                        id="signup-username" 
                        placeholder="coolpythonista" 
                        required
                        className="bg-space-deep-purple/20 border-space-nebula/30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email" 
                        placeholder="youremail@example.com" 
                        type="email" 
                        required
                        className="bg-space-deep-purple/20 border-space-nebula/30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password" 
                        type="password" 
                        required
                        className="bg-space-deep-purple/20 border-space-nebula/30"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm text-gray-400">
                        I agree to the <a href="#" className="text-space-nebula hover:underline">Terms of Service</a> and <a href="#" className="text-space-nebula hover:underline">Privacy Policy</a>
                      </Label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="cosmic-button w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                    
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-space-nebula/20"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-card text-gray-400">or sign up with</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="border-space-nebula/30 hover:bg-space-nebula/10"
                      >
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="border-space-nebula/30 hover:bg-space-nebula/10"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Google
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="justify-center">
              <p className="text-sm text-gray-400">
                By continuing, you acknowledge that you have read and understand our 
                <a href="#" className="text-space-nebula hover:underline ml-1">Data Use Policy</a>.
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default Login;
