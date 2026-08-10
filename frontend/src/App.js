import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import JobSearch from './components/jobseeker/JobSearch';
import Dashboard from './components/jobseeker/Dashboard';
import ApplyJob from './components/jobseeker/ApplyJob';
import Profile from './components/jobseeker/Profile';
import Attendance from './components/jobseeker/Attendance';
import Complaints from './components/jobseeker/Complaints';
import LeaveRequests from './components/jobseeker/LeaveRequests';
import JobList from './components/employer/JobList';
import PostJob from './components/employer/PostJob';
import Applications from './components/employer/Applications';
import EmployerProfile from './components/employer/EmployerProfile';
import CandidateList from './components/employer/CandidateList';
import EmployerAttendance from './components/employer/EmployerAttendance';
import AdminDashboard from './components/admin/AdminDashboard';
import ManageUsers from './components/admin/ManageUsers';
import JobSeekerAttendance from './components/admin/JobSeekerAttendance';
import LeaveManagement from './components/admin/LeaveManagement';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import AIChat from './components/common/AIChat';
import About from './components/About';
import Contact from './components/Contact';
import NotFound from './components/common/NotFound';

// Internship Imports
import InternshipList from './components/internships/InternshipList';
import ApplyInternship from './components/internships/ApplyInternship';

// ============================================
// NEW: HRM ADMIN IMPORTS
// ============================================
import ConfigManager from './components/admin/ConfigManager';
import EmployeeManager from './components/admin/EmployeeManager';
import LeaveManager from './components/admin/LeaveManager';
import AttendanceManager from './components/admin/AttendanceManager';
import TrainingManager from './components/admin/TrainingManager';
import ComplaintManager from './components/admin/ComplaintManager';
import DelegationManager from './components/admin/DelegationManager';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { useTheme } from './context/ThemeContext';

function App() {
    const { theme } = useTheme();
    
    return (
        <AuthProvider>
            <LanguageProvider>
                <Router>
                    <div className="d-flex flex-column min-vh-100">
                        <Navbar />
                        <main className="flex-grow-1">
                            <Routes>
                                {/* ============================================
                                    PUBLIC ROUTES
                                ============================================ */}
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/jobs" element={<JobSearch />} />
                                <Route path="/candidates" element={<CandidateList />} />
                                <Route path="/internships" element={<InternshipList />} />
                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                <Route path="/terms" element={<TermsOfService />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/contact" element={<Contact />} />

                                {/* ============================================
                                    JOB SEEKER ROUTES
                                ============================================ */}
                                <Route path="/jobseeker/dashboard" element={
                                    <ProtectedRoute allowedRoles={['jobseeker']}>
                                        <Dashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/jobseeker/profile" element={
                                    <ProtectedRoute allowedRoles={['jobseeker']}>
                                        <Profile />
                                    </ProtectedRoute>
                                } />
                                <Route path="/jobseeker/apply/:jobId" element={
                                    <ProtectedRoute allowedRoles={['jobseeker']}>
                                        <ApplyJob />
                                    </ProtectedRoute>
                                } />
                                <Route path="/jobseeker/attendance" element={
                                    <ProtectedRoute allowedRoles={['jobseeker']}>
                                        <Attendance />
                                    </ProtectedRoute>
                                } />
                                <Route path="/jobseeker/leave" element={
                                    <ProtectedRoute allowedRoles={['jobseeker']}>
                                        <LeaveRequests />
                                    </ProtectedRoute>
                                } />
                                <Route path="/jobseeker/complaints" element={
                                    <ProtectedRoute allowedRoles={['jobseeker']}>
                                        <Complaints />
                                    </ProtectedRoute>
                                } />

                                {/* ============================================
                                    EMPLOYER ROUTES
                                ============================================ */}
                                <Route path="/employer/jobs" element={
                                    <ProtectedRoute allowedRoles={['employer']}>
                                        <JobList />
                                    </ProtectedRoute>
                                } />
                                <Route path="/employer/post-job" element={
                                    <ProtectedRoute allowedRoles={['employer']}>
                                        <PostJob />
                                    </ProtectedRoute>
                                } />
                                <Route path="/employer/applications/:jobId" element={
                                    <ProtectedRoute allowedRoles={['employer']}>
                                        <Applications />
                                    </ProtectedRoute>
                                } />
                                <Route path="/employer/profile" element={
                                    <ProtectedRoute allowedRoles={['employer']}>
                                        <EmployerProfile />
                                    </ProtectedRoute>
                                } />
                                <Route path="/employer/attendance" element={
                                    <ProtectedRoute allowedRoles={['employer']}>
                                        <EmployerAttendance />
                                    </ProtectedRoute>
                                } />

                                {/* ============================================
                                    ADMIN ROUTES
                                ============================================ */}
                                {/* Core Admin */}
                                <Route path="/admin/dashboard" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/users" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <ManageUsers />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/attendance" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <JobSeekerAttendance />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/leaves" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <LeaveManagement />
                                    </ProtectedRoute>
                                } />

                                {/* ============================================
                                    NEW: HRM ADMIN ROUTES
                                ============================================ */}
                                {/* Configuration Module */}
                                <Route path="/admin/config" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <ConfigManager />
                                    </ProtectedRoute>
                                } />

                                {/* Employee Management */}
                                <Route path="/admin/employees" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <EmployeeManager />
                                    </ProtectedRoute>
                                } />

                                {/* Leave Management */}
                                <Route path="/admin/leaves" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <LeaveManager />
                                    </ProtectedRoute>
                                } />

                                {/* Attendance Management */}
                                <Route path="/admin/attendance" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AttendanceManager />
                                    </ProtectedRoute>
                                } />

                                {/* Training Management */}
                                <Route path="/admin/training" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <TrainingManager />
                                    </ProtectedRoute>
                                } />

                                {/* Complaint Management */}
                                <Route path="/admin/complaints" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <ComplaintManager />
                                    </ProtectedRoute>
                                } />

                                {/* Delegation Management */}
                                <Route path="/admin/delegations" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <DelegationManager />
                                    </ProtectedRoute>
                                } />

                                {/* ============================================
                                    INTERNSHIP ROUTES
                                ============================================ */}
                                <Route path="/internships/apply/:id" element={
                                    <ProtectedRoute allowedRoles={['jobseeker']}>
                                        <ApplyInternship />
                                    </ProtectedRoute>
                                } />

                                {/* ============================================
                                    404 NOT FOUND
                                ============================================ */}
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </main>
                        <Footer />
                        <AIChat />
                        <ToastContainer
                            position="top-right"
                            autoClose={3000}
                            hideProgressBar={false}
                            newestOnTop
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme={theme === 'dark' ? 'dark' : 'light'}
                        />
                    </div>
                </Router>
            </LanguageProvider>
        </AuthProvider>
    );
}

export default App;