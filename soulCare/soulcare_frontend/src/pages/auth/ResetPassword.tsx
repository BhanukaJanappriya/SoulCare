import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ResetPassword: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(""); // For mismatch error
  const [isLoading, setIsLoading] = useState(false);

  // Check for password match dynamically
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
        // This is a fallback if the user submits despite the UI warning
        setPasswordError("Passwords do not match");
        return;
    }

    setIsLoading(true);
    try {
      await axios.post("http://localhost:8000/api/auth/password-reset-confirm/", {
        uidb64: uid,
        token: token,
        new_password: password,
        confirm_password: confirmPassword
      });
      
      toast({ title: "Success", description: "Your password has been reset. Please log in." });
      
      // Redirect to login after short delay
      setTimeout(() => navigate("/auth/login"), 2000);
      
    } catch (err: any) {
        const msg = err.response?.data?.detail || "Failed to reset password. The link may be invalid or expired.";
        toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen healthcare-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="healthcare-card shadow-lg">
          <CardHeader className="text-center">
             <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="w-7 h-7 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  minLength={8}
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  placeholder="Confirm new password"
                  className={passwordError ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {/* Red warning message */}
                {passwordError && (
                  <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                    <XCircle className="w-3 h-3" /> {passwordError}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !!passwordError}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;