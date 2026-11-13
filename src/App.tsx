import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Pages
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';

// Student Pages
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { CreateComplaintPage } from '@/pages/student/CreateComplaintPage';
import { MyComplaintsPage } from '@/pages/student/MyComplaintsPage';
import { ComplaintDetailPage } from '@/pages/student/ComplaintDetailPage';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminComplaintDetailPage } from '@/pages/admin/AdminComplaintDetailPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Authenticated Account Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/new-complaint"
                element={
                  <ProtectedRoute allowedRole="student">
                    <CreateComplaintPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/complaints"
                element={
                  <ProtectedRoute allowedRole="student">
                    <MyComplaintsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/complaints/:id"
                element={
                  <ProtectedRoute allowedRole="student">
                    <ComplaintDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints/:id"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminComplaintDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
