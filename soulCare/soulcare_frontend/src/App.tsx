import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"; // Your gatekeeper

// --- Import all your pages ---
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import CounselorRegister from "./pages/Registration/CounselorRegister";
import DoctorRegister from "./pages/Registration/DoctorRegister";
import PatientRegister from "./pages/Registration/PatientRegister";
import Dashboard from "./pages/Dashboard";
//import PatientDashboard from "./pages/PatientDashboard"; // The patient's dashboard
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Profile from "./pages/Profile";
import Blogs from "./pages/Blogs";
import Schedule from "./pages/Schedule";
import Prescriptions from "./pages/Prescriptions";
import VideoCall from "./pages/VideoCall";
import Content from "./pages/Content";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* --- Public Routes (anyone can see these) --- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<PatientRegister />} />
            {/* You might want to rename these to be more consistent */}
            <Route path="/counselor-register" element={<CounselorRegister />} />
            <Route path="/doctor-register" element={<DoctorRegister />} />


            {/* --- Doctor & Counselor Shared Routes (Patients CANNOT see these) --- */}
            {/* CORRECTED: Added allowedRoles to every protected route */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['doctor', 'counselor']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/patients" element={
              <ProtectedRoute allowedRoles={['doctor', 'counselor']}>
                <Patients />
              </ProtectedRoute>
            } />
            <Route path="/appointments" element={
              <ProtectedRoute allowedRoles={['doctor', 'counselor']}>
                <Appointments />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['doctor', 'counselor']}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/blogs" element={
              <ProtectedRoute allowedRoles={['doctor', 'counselor']}>
                <Blogs />
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute allowedRoles={['doctor', 'counselor']}>
                <Schedule />
              </ProtectedRoute>
            } />
            <Route path="/content" element={
              <ProtectedRoute allowedRoles={['doctor', 'counselor']}>
                <Content />
              </ProtectedRoute>
            } />


            {/* --- Routes for ALL Authenticated Users (including Patients) --- */}
            <Route path="/video-calls" element={
              <ProtectedRoute allowedRoles={['doctor', 'counselor', 'user']}>
                <VideoCall />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute allowedRoles={['doctor', 'counselor', 'user']}>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['doctor', 'counselor', 'user']}>
                <Settings />
              </ProtectedRoute>
            } />


            {/* --- Doctor-Only Route --- */}
            <Route path="/prescriptions" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Prescriptions />
              </ProtectedRoute>
            } />


            {/* --- Patient-Only Route (using the 'user' role) --- */}
          {/*  <Route path="/patient/dashboard" element={
              <ProtectedRoute allowedRoles={['user']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />*/}


            {/* --- Not Found Route --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
