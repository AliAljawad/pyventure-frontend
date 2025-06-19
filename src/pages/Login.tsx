import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { loginUser, registerUser } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  // Get the return path from location state
  const from = location.state?.from?.pathname || "/playground";

  useEffect(() => {
    document.title = "Login - PyVenture";

    // If user is already authenticated, redirect to the intended page
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await loginUser(loginData.email, loginData.password);
      // Store the email in sessionStorage for the 2FA verification
      sessionStorage.setItem("authEmail", loginData.email);
      // Store the intended destination
      sessionStorage.setItem("authRedirect", from);
      toast.success(data.message || "Please check your email for the 2FA code");
      navigate("/2fa");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await registerUser(
        signupData.name,
        signupData.username,
        signupData.email,
        signupData.password,
        signupData.password_confirmation
      );
      // Store the email in sessionStorage for the 2FA verification
      sessionStorage.setItem("authEmail", signupData.email);
      // Store the intended destination
      sessionStorage.setItem("authRedirect", from);
      toast.success(
        data.message || "Account created! Please verify your email"
      );
      navigate("/2fa");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
        console.log(error.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render the login form if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-md">
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

                {/* LOGIN TAB */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        required
                        className="bg-space-deep-purple/20 border-space-nebula/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <a
                          href="#"
                          className="text-sm text-space-nebula hover:underline"
                        >
                          Forgot password?
                        </a>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        required
                        className="bg-space-deep-purple/20 border-space-nebula/30"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label
                        htmlFor="remember"
                        className="text-sm text-gray-400"
                      >
                        Remember me
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
                          Logging in...
                        </>
                      ) : (
                        <>
                          Login
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* SIGNUP TAB */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Name</Label>
                      <Input
                        id="signup-name"
                        value={signupData.name}
                        onChange={(e) =>
                          setSignupData({ ...signupData, name: e.target.value })
                        }
                        required
                        placeholder="Ada Lovelace"
                        className="bg-space-deep-purple/20 border-space-nebula/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-username">Username</Label>
                      <Input
                        id="signup-username"
                        value={signupData.username}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            username: e.target.value,
                          })
                        }
                        required
                        placeholder="coolpythonista"
                        className="bg-space-deep-purple/20 border-space-nebula/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            email: e.target.value,
                          })
                        }
                        required
                        placeholder="youremail@example.com"
                        className="bg-space-deep-purple/20 border-space-nebula/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            password: e.target.value,
                          })
                        }
                        required
                        className="bg-space-deep-purple/20 border-space-nebula/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password-confirmation">
                        Confirm Password
                      </Label>
                      <Input
                        id="signup-password-confirmation"
                        type="password"
                        value={signupData.password_confirmation}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            password_confirmation: e.target.value,
                          })
                        }
                        required
                        className="bg-space-deep-purple/20 border-space-nebula/30"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm text-gray-400">
                        I agree to the{" "}
                        <a
                          href="#"
                          className="text-space-nebula hover:underline"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          className="text-space-nebula hover:underline"
                        >
                          Privacy Policy
                        </a>
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
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="justify-center">
              <p className="text-sm text-gray-400">
                By continuing, you acknowledge that you have read and understand
                our
                <a href="#" className="text-space-nebula hover:underline ml-1">
                  Data Use Policy
                </a>
                .
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
