import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { verify2FA } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";

const TwoFactorAuth = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    document.title = "2FA Verification - PyVenture";

    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem("authEmail");
    if (!storedEmail) {
      toast.error("No email found. Please login again.");
      navigate("/login");
      return;
    }
    setEmail(storedEmail);

    // If user is already authenticated, redirect
    if (isAuthenticated) {
      const redirectPath =
        sessionStorage.getItem("authRedirect") || "/playground";
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, isAuthenticated]);

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email not found. Please login again.");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const data = await verify2FA(email, code);

      // Assuming your API returns token and user data after successful 2FA
      if (data.token && data.user) {
        // Use the auth context to login
        login(data.token, data.user);

        // Clear session storage
        sessionStorage.removeItem("authEmail");

        // Get redirect path and clear it
        const redirectPath =
          sessionStorage.getItem("authRedirect") || "/playground";
        sessionStorage.removeItem("authRedirect");

        toast.success("Authentication successful!");
        navigate(redirectPath, { replace: true });
      } else {
        toast.error("Invalid response from server");
      }
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

  const handleResendCode = async () => {
    // You might want to implement a resend code function
    toast.info("Resend code functionality not implemented yet");
  };

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
                Two-Factor <span className="glow-text">Authentication</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Enter the verification code sent to{" "}
                {email
                  ? `${email.substring(0, 3)}***@${email.split("@")[1]}`
                  : "your email"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="bg-space-deep-purple/20 border-space-nebula/30 text-center text-lg tracking-wider"
                  />
                </div>

                <Button
                  type="submit"
                  className="cosmic-button w-full"
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-space-nebula hover:underline"
                    >
                      Resend Code
                    </button>
                  </p>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default TwoFactorAuth;
