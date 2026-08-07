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
import JobList from './components/employer/JobList';
import PostJob from './components/employer/PostJob';
import Applications from './components/employer/Applications';
import EmployerProfile from './components/employer/EmployerProfile';
import AdminDashboard from './components/admin/AdminDashboard';
import ManageUsers from './components/admin/ManageUsers';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import AIChat from './components/common/AIChat';
// NEW: Internship Imports
import InternshipList from './components/internships/InternshipList';
import ApplyInternship from './components/internships/ApplyInternship';
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
                                {/* Public Routes */}
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/jobs" element={<JobSearch />} />
                                <Route path="/internships" element={<InternshipList />} />
                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                <Route path="/terms" element={<TermsOfService />} />

                                {/* Job Seeker Routes */}
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

                                {/* Employer Routes */}
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

                                {/* Admin Routes */}
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

                                {/* Internship Routes */}
                                <Route path="/internships/apply/:id" element={
                                    <ProtectedRoute allowedRoles={['jobseeker']}>
                                        <ApplyInternship />
                                    </ProtectedRoute>
                                } />

                                {/* 404 Not Found */}
                                <Route path="*" element={<Navigate to="/" />} />
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