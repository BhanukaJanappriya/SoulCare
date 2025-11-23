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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
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



// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext"; 
// import { api } from "@/api"; // Import your API instance

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { LogIn, ArrowLeft, Key, Lock, User as UserIcon } from "lucide-react";

// const LoginPage: React.FC = () => {
  
//   // Note: ensure your 'login' function in AuthContext can accept the 
//   // response data object (tokens) directly, OR simply use the logic below 
//   // to manually save tokens if your context is strict.
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     username: "",
//     password: "",
//   });
  
//   // --- 2FA STATE ---
//   const [show2FAInput, setShow2FAInput] = useState(false);
//   const [otpCode, setOtpCode] = useState("");
//   // -----------------

//   const [errors, setErrors] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrors([]);
//     setIsLoading(true);

//     try {
//         // 1. Prepare Payload
//         const payload: any = {
//             username: formData.username,
//             password: formData.password
//         };

//         // If we are in 2FA mode, add the OTP
//         if (show2FAInput && otpCode) {
//             payload.otp = otpCode;
//         }

//         // 2. Send Request directly via API first
//         // (We do this to check for the 'requires_2fa' flag before completing login)
//         const response = await api.post("auth/login/", payload);

//         // 3. Check for 2FA Requirement
//         if (response.data.requires_2fa) {
//             setShow2FAInput(true);
//             setIsLoading(false);
//             return; // Stop here, wait for user to enter code
//         }

//         // 4. Login Successful (Tokens received)
//         // Pass the data to your AuthContext to save state/redirect
//         // If your context login() only takes (user, pass), you might need to update it 
//         // or manually save tokens here:
//         // localStorage.setItem('access_token', response.data.access);
        
//         // Assuming your AuthContext 'login' can handle the flow or we just call it 
//         // to trigger the state update. For now, let's try standard login flow 
//         // or if you updated AuthContext as discussed:
//         await login(formData.username, formData.password, payload.otp); 
        
//         // If the line above fails because Context isn't updated, use:
//         // window.location.href = "/dashboard"; // Force redirect after manual token save

//     } catch (error: any) {
//         console.error("Login Error:", error);
//         let errorMessages: string[] = [];

//         if (error.response && error.response.data) {
//             const data = error.response.data;
            
//             // Handle list of errors or single string
//             if (Array.isArray(data.non_field_errors)) {
//                 errorMessages.push(...data.non_field_errors);
//             } else if (typeof data === 'string') {
//                 errorMessages.push(data);
//             } else {
//                  // Check for specific field errors
//                  Object.keys(data).forEach((key) => {
//                     const msgs = data[key];
//                     if (Array.isArray(msgs)) {
//                         errorMessages.push(`${key}: ${msgs.join(" ")}`);
//                     } else if (typeof msgs === "string") {
//                         errorMessages.push(msgs);
//                     }
//                  });
//             }
//         } else {
//             errorMessages.push("An unexpected error occurred. Please try again.");
//         }
        
//         setErrors(errorMessages);
//     } finally {
//         setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
//       <div className="w-full max-w-md">
//         <Card>
//           <CardHeader className="space-y-1">
//             <CardTitle className="text-2xl font-bold text-center">
//               {show2FAInput ? "Two-Factor Authentication" : "Welcome Back"}
//             </CardTitle>
//             <CardDescription className="text-center">
//               {show2FAInput 
//                 ? "Enter the 6-digit code from your authenticator app." 
//                 : "Enter your credentials to access your account"}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
              
//               {!show2FAInput ? (
//                 /* --- STANDARD LOGIN --- */
//                 <>
//                   <div className="space-y-2">
//                     <Label htmlFor="username">Username</Label>
//                     <div className="relative">
//                         <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                         <Input
//                         id="username"
//                         name="username"
//                         type="text"
//                         placeholder="Enter your username"
//                         className="pl-10"
//                         value={formData.username}
//                         onChange={handleChange}
//                         required
//                         />
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="password">Password</Label>
//                     <div className="relative">
//                         <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                         <Input
//                         id="password"
//                         name="password"
//                         type="password"
//                         placeholder="Enter your password"
//                         className="pl-10"
//                         value={formData.password}
//                         onChange={handleChange}
//                         required
//                         />
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 /* --- 2FA INPUT --- */
//                 <div className="space-y-2">
//                     <Label htmlFor="otp">Authentication Code</Label>
//                     <div className="relative">
//                         <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                         <Input
//                             id="otp"
//                             name="otp"
//                             type="text"
//                             placeholder="123456"
//                             className="pl-10 text-center tracking-widest text-lg font-mono"
//                             value={otpCode}
//                             onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                             autoFocus
//                             required
//                         />
//                     </div>
//                     <Button 
//                         variant="link" 
//                         className="px-0 text-sm text-muted-foreground w-full"
//                         onClick={() => { setShow2FAInput(false); setOtpCode(""); }}
//                         type="button"
//                     >
//                         Back to Login
//                     </Button>
//                 </div>
//               )}

//               {errors.length > 0 && (
//                 <Alert variant="destructive">
//                   <AlertTitle>Login Failed!</AlertTitle>
//                   <AlertDescription>
//                     <ul className="list-disc pl-5 space-y-1">
//                       {errors.map((errorMsg, index) => (
//                         <li key={index}>{errorMsg}</li>
//                       ))}
//                     </ul>
//                   </AlertDescription>
//                 </Alert>
//               )}

//               <Button
//                 type="submit"
//                 className="w-full healthcare-button-primary"
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Verifying..." : (show2FAInput ? "Verify Code" : "Sign In")}
//               </Button>
//             </form>
            
//             {!show2FAInput && (
//                 <div className="text-center mt-4 space-y-2">
//                 <p className="text-sm text-muted-foreground">
//                     Don't have an account?{" "}
//                     <Link to="/" className="text-primary hover:underline">
//                     Sign up
//                     </Link>
//                 </p>
//                 </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;