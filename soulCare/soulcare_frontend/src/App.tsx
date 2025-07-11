import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import Appointments from './pages/Appointments/Appointments'
import Activity from './pages/Activity/Activity'
import PatientRegister from "./pages/Registration/PatientRegister";
import DoctorRegister from "./pages/Registration/DoctorRegister";
import CounselorRegister from "./pages/Registration/CounselorRegister";
import LoginPage from "./pages/Registration/LoginPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <main className="w-full max-w-[1440px] h-[960px] bg-white rounded-4xl shadow-custom overflow-hidden">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/register/patient" element={<PatientRegister />} />
              <Route path="/register/doctor" element={<DoctorRegister />} />
              <Route path="/register/counselor" element={<CounselorRegister />} />
              <Route path="/login" element={<LoginPage/>}/>
            </Routes>
          </Layout>
        </main>
      </div>
    </Router>
  )
}

export default App
