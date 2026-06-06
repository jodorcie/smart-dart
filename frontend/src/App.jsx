import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import PassengerDashboard from './pages/PassengerDashboard';
import OperatorDashboard from './pages/OperatorDashboard';
import LoginPage from './pages/LoginPage';
import useSocket from './hooks/useSocket';
import useFirebaseBuses from './hooks/useFirebaseBuses';

export default function App() {
  useSocket();
  useFirebaseBuses(); // overlays real ESP32 GPS when Firebase is configured

  return (
    <div className="flex flex-col min-h-screen bg-dart-gray">
      <Navbar />
      <ErrorBoundary>
      <Routes>
        {/* Public – passengers */}
        <Route path="/" element={<PassengerDashboard />} />

        {/* Operator login */}
        <Route path="/operator/login" element={<LoginPage />} />

        {/* Protected – operators only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <OperatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <OperatorDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      </ErrorBoundary>
    </div>
  );
}
