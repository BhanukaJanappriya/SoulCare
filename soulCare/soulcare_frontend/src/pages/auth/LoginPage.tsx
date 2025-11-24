import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; 

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LogIn, ArrowLeft } from "lucide-react";

const LoginPage: React.FC = () => {
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    
    const result = await login(formData.username, formData.password);

    if (result.success && result.user) {
      
      const role = result.user.role;

      if (role === "doctor" || role === "counselor") {
        navigate("/dashboard");
      } else if (role === "user") {

        navigate("/patient/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        
        navigate("/");
      }
    } else {
      
      setErrors([result.error || "An unknown login error occurred."]);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen healthcare-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="healthcare-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>Access your account to continue</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                </div>
                
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />

                <div className="flex justify-end" >
                  <Link 
                        to="/auth/forgot-password" 
                        className="text-xs text-primary hover:underline font-medium"
                    >
                        Forgot password?
                </Link>
                </div>
              </div>

              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTitle>Login Failed!</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1">
                      {errors.map((errorMsg, index) => (
                        <li key={index}>{errorMsg}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full healthcare-button-primary"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
            <div className="text-center mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
              {/*<Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to home
              </Link>*/}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;



