// client/src/App.jsx
import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalStyle from './GlobalStyles';
import LoginPage from './pages/LoginPage';
import GoogleCallback from './pages/GoogleCallback';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './ProtectedRoute';
import { Navigate } from 'react-router-dom';

// Import your dashboards
import AdminDashboard from './dashboards/AdminDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import CounselorDashboard from './dashboards/CounselorDashboard';
import VolunteerDashboard from './dashboards/VolunteerDashboard';
// Import other dashboards...

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-dashboard/*"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/counselor-dashboard"
            element={
              <ProtectedRoute requiredRole="counselor">
                <CounselorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/volunteer-dashboard/*"
            element={
              <ProtectedRoute requiredRole="volunteer">
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          {/* Add routes for other dashboards */}
          
          {/* Root: redirect to role-specific dashboard if logged-in */}
          <Route
            path="/"
            element={
              (() => {
                const role = typeof window !== 'undefined' ? (localStorage.getItem('userRole') || '').toLowerCase() : null;
                if (!role) return <LoginPage />;

                if (role.includes('admin')) return <Navigate to="/admin-dashboard" replace />;
                if (role.includes('student')) return <Navigate to="/student-dashboard" replace />;
                if (role.includes('counselor')) return <Navigate to="/counselor-dashboard" replace />;
                if (role.includes('volunteer')) return <Navigate to="/volunteer-dashboard" replace />;

                return <LoginPage />;
              })()
            }
          />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;