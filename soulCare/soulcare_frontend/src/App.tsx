import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import AdminLogin from "./pages/auth/AdminLogin";
import CounselorRegister from "./pages/Registration/CounselorRegister";
import DoctorRegister from "./pages/Registration/DoctorRegister";
import PatientRegister from "./pages/Registration/PatientRegister";
import Dashboard from "./pages/Dashboard";

// forgot password imports
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

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
import PatientDetailPage from "./pages/PatientDetailPage";
import PatientChatBot from "./pages/Patient/PatientChatBot";

//admin imports
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageDoctorsPage from "./pages/admin/ManageDoctorsPage";
import ManageCounselorsPage from "./pages/admin/ManageCounselorsPage";
import ManagePatientsPage from "./pages/admin/ManagePatientsPage";
import ManageBlogsPage from "./pages/admin/ManageBlogsPage";
import ManageContentPage from "./pages/admin/ManageContentPage";
import ManageFeedbackPage from "./pages/admin/ManageFeedbackPage";
import ManageGameDataPage from "./pages/admin/ManageGameDataPage";

//Patient imports
import PatientLayout from "./components/layout/PatientLayout";
import PatientDashboard from "./pages/Patient/PatientDashboard";
import PatientAppointments from "./pages/Patient/PatientAppointments";
import PatientHabits from "./pages/Patient/PatientHabits";
import MeditationPage from "./pages/Patient/MeditationPage";
import PatientJournal from "./pages/Patient/PatientJournal";
import PatientBlogs from "./pages/Patient/PatientBlogs";
import BookAppointmentPage from "./pages/Patient/BookAppointmentPage";
import ProviderDetailPage from "./pages/Patient/ProviderDetailPage";
import PatientGames from "./pages/Patient/PatientGames";
import PatientPrescriptions from "./pages/Patient/PatientPrescriptions";
import MoodTracker from "./pages/Patient/MoodTracker";
import PatientMessages from "./pages/Patient/PatientMessages";
import PatientContent from "./pages/Patient/PatientContent";
import PatientProfile from "./pages/Patient/PatientProfile";


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
            <Route path="/auth/login/admin" element={<AdminLogin />} />
            <Route path="/auth/signup" element={<PatientRegister />} />
            <Route path="/counselor-register" element={<CounselorRegister />} />
            <Route path="/doctor-register" element={<DoctorRegister />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password/:uid/:token" element={<ResetPassword />} />

            <Route
              path="/patient-details/:patientId"
              element={
                <ProtectedRoute allowedRoles={["doctor", "counselor"]}>
                  <PatientDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patients/:id"
              element={
                <ProtectedRoute allowedRoles={["doctor", "counselor"]}>
                  <PatientDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["doctor", "counselor"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patients"
              element={
                <ProtectedRoute allowedRoles={["doctor", "counselor"]}>
                  <Patients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute allowedRoles={["doctor", "counselor"]}>
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["doctor", "counselor"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blogs"
              element={
                <ProtectedRoute allowedRoles={["doctor", "counselor"]}>
                  <Blogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <ProtectedRoute allowedRoles={["doctor", "counselor"]}>
                  <Schedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/content"
              element={
                <ProtectedRoute allowedRoles={["doctor", "counselor"]}>
                  <Content />
                </ProtectedRoute>
              }
            />

            <Route
              path="/video-calls"
              element={
                <ProtectedRoute allowedRoles={["doctor", "counselor", "user"]}>
                  <VideoCall />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute allowedRoles={["doctor", "counselor", "user"]}>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={["doctor", "counselor", "user"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* --- Doctor-Only Route --- */}
            <Route
              path="/prescriptions"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <Prescriptions />
                </ProtectedRoute>
              }
            />
            {/* Patient Routes */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <PatientLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PatientDashboard />} />
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="habits" element={<PatientHabits />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route
                path="book-appointment"
                element={<BookAppointmentPage />}
              />
              <Route
                path="providers/:providerId"
                element={<ProviderDetailPage />}
              />
              <Route path="blogs" element={<PatientBlogs />} />
              <Route path="journal" element={<PatientJournal />} />
              <Route path="meditation" element={<MeditationPage />} />
              <Route path="games" element={<PatientGames />} />
              <Route path="profile" element={<PatientProfile />} />
              <Route path="prescriptions" element={<PatientPrescriptions />} />
              <Route path="mood" element={<MoodTracker />} />
              <Route path="messages" element={<PatientMessages />} />
              <Route path="content" element={<PatientContent />} />
              <Route path="/patient/chatbot" element={<PatientChatBot />} />
            </Route>

            {/* --- Admin Routes --- */}

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="manage-doctors" element={<ManageDoctorsPage />} />
              <Route
                path="manage-counselors"
                element={<ManageCounselorsPage />}
              />
              <Route path="manage-patients" element={<ManagePatientsPage />} />
              <Route path="manage-blogs" element={<ManageBlogsPage />} />
              <Route path="manage-content" element={<ManageContentPage />} />
              <Route path="manage-feedback" element={<ManageFeedbackPage />} />
              <Route path="game-data" element={<ManageGameDataPage />} />

            </Route>

            {/* --- Not Found Route --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
