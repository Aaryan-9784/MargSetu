import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AssetInventoryPage from './pages/AssetInventoryPage';
import AssetDetailsPage from './pages/AssetDetailsPage';
import MaintenancePage from './pages/MaintenancePage';
import LifecyclePage from './pages/LifecyclePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/assets" element={<AssetInventoryPage />} />
              <Route path="/assets/:id" element={<AssetDetailsPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/lifecycle" element={<LifecyclePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
