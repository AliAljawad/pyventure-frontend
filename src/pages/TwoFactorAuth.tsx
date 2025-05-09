import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { verify2FA } from "@/api/auth";

const TwoFactorAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");

  // Update title and get email from session storage
  useEffect(() => {
    document.title = "2FA Verification - PyVenture";

    const storedEmail = sessionStorage.getItem("authEmail");
    if (!storedEmail) {
      // If no email in session storage, redirect to login
      toast.error("Authentication error. Please log in again.");
      navigate("/login");
      return;
    }

    setEmail(storedEmail);
  }, [navigate]);

  const handleVerify = async () => {
    setIsLoading(true);
    const otpValue = otp.join("");

    try {
      const data = await verify2FA(email, otpValue);

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Clear the session email since we no longer need it
      sessionStorage.removeItem("authEmail");

      toast.success("2FA verification successful!", {
        description: "Welcome to PyVenture!",
        icon: <ShieldCheck className="text-green-500" />,
      });

      navigate("/playground");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Invalid verification code");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedNumbers = pastedData
      .replace(/[^\d]/g, "")
      .slice(0, 6)
      .split("");

    const newOtp = [...otp];
    pastedNumbers.forEach((num, index) => {
      if (index < 6) newOtp[index] = num;
    });

    setOtp(newOtp);
  };

  const handleResendCode = async () => {
    try {
      // This would need to call an API endpoint to resend the code
      // For now we'll just show a toast
      toast.success("A new verification code has been sent to your email");
    } catch (error) {
      toast.error("Failed to resend code");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="cosmic-card shadow-xl border-space-nebula/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-space-nebula/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-space-nebula" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-gray-400">
                Please enter the verification code sent to {email}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center rounded-md bg-white/10 border border-space-nebula/30 text-white text-xl focus:border-space-nebula focus:ring-1 focus:ring-space-nebula focus:outline-none"
                  />
                ))}
              </div>

              <div className="text-sm text-center text-gray-400 mt-4">
                Didn't receive a code?{" "}
                <button
                  className="text-space-nebula hover:underline"
                  onClick={handleResendCode}
                >
                  Resend
                </button>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                onClick={handleVerify}
                className="cosmic-button w-full"
                disabled={isLoading || otp.some((digit) => !digit)}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Code
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default TwoFactorAuth;
