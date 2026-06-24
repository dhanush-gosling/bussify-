import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Passenger
import PassengerDashboard from './pages/passenger/Dashboard';
import PassengerCard from './pages/passenger/CardPage';
import SearchBus from './pages/passenger/SearchBus';
import MyTickets from './pages/passenger/MyTickets';

// Conductor
import ConductorDashboard from './pages/conductor/Dashboard';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminBuses from './pages/admin/Buses';
import AdminRoutes from './pages/admin/Routes';
import AdminConductors from './pages/admin/Conductors';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="loading-spinner" /></div>;
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login/:role" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Passenger */}
          <Route path="/passenger" element={<ProtectedRoute role="passenger"><PassengerDashboard /></ProtectedRoute>} />
          <Route path="/passenger/card" element={<ProtectedRoute role="passenger"><PassengerCard /></ProtectedRoute>} />
          <Route path="/passenger/search" element={<ProtectedRoute role="passenger"><SearchBus /></ProtectedRoute>} />
          <Route path="/passenger/tickets" element={<ProtectedRoute role="passenger"><MyTickets /></ProtectedRoute>} />

          {/* Conductor */}
          <Route path="/conductor" element={<ProtectedRoute role="conductor"><ConductorDashboard /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/buses" element={<ProtectedRoute role="admin"><AdminBuses /></ProtectedRoute>} />
          <Route path="/admin/routes" element={<ProtectedRoute role="admin"><AdminRoutes /></ProtectedRoute>} />
          <Route path="/admin/conductors" element={<ProtectedRoute role="admin"><AdminConductors /></ProtectedRoute>} />
        </Routes>

        <ToastContainer
          position="bottom-right"
          theme="dark"
          toastStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
