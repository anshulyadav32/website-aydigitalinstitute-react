import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { useScrollAnimation } from './utils/useScrollAnimation';

// Common Components
import SEO from './components/common/SEO';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/WhatsAppButton';

// Page Components
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/auth/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminPortal from './components/admin/AdminPortal';
import AdminRoute from './components/auth/AdminRoute';

function AppContent() {
  useScrollAnimation();

  return (
    <div className="App">
      <SEO />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPortal />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
