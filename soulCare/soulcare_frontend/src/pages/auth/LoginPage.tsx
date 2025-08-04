import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Stethoscope, Brain, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { useToast } from "@/hooks/use-toast";

const LoginPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const selectedRole = location.state?.selectedRole as UserRole;
  const [role, setRole] = useState<UserRole>(selectedRole || "doctor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = await login(email, password, role);

    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome back to the healthcare platform!",
        className: "healthcare-button-success",
      });
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Please check your email and password.");
    }
  };

  const getDemoCredentials = () => {
    if (role === "doctor") {
      return "dr.smith@healthcare.com / password123";
    }
    return "counselor.jones@healthcare.com / password123";
  };

  return (
    <div className="min-h-screen healthcare-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="healthcare-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                {role === "doctor" ? (
                  <Stethoscope className="w-8 h-8 text-primary" />
                ) : (
                  <Brain className="w-8 h-8 text-primary" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {role === "doctor" ? "Doctor" : "Counselor"} Login
            </CardTitle>
            <CardDescription>
              Sign in to access your healthcare dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Role Toggle */}
            <div className="flex rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  role === "doctor"
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => setRole("counselor")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  role === "counselor"
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Counselor
              </button>
            </div>

            {/* Demo Credentials Alert */}
            <Alert className="bg-primary/5 border-primary/20">
              <AlertDescription className="text-sm">
                <strong>Demo credentials:</strong> {getDemoCredentials()}
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <Alert className="bg-destructive/10 border-destructive/20">
                  <AlertDescription className="text-destructive text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full healthcare-button-primary"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/auth/signup"
                  state={{ selectedRole: role }}
                  className="text-primary hover:underline"
                >
                  Sign up
                </Link>
              </p>

              <Link
                to="/"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to role selection
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
