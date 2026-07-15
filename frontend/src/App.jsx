import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AntigravityBackground from './components/AntigravityBackground';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentJobs from './pages/student/StudentJobs';
import StudentUploads from './pages/student/StudentUploads';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminJobs from './pages/admin/AdminJobs';
import AdminProfile from './pages/admin/AdminProfile';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          {/* Animated Canvas Particle Hover Background */}
          <AntigravityBackground />
          
          <Navbar />
          
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRole="student">
                    <StudentProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jobs" 
                element={
                  <ProtectedRoute allowedRole="student">
                    <StudentJobs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/uploads" 
                element={
                  <ProtectedRoute allowedRole="student">
                    <StudentUploads />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Protected Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/jobs" 
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminJobs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/profile" 
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminProfile />
                  </ProtectedRoute>
                } 
              />

              {/* Default fallback redirects */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
