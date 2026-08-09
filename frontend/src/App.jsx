import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DutyRoster from './pages/DutyRoster';
import Employees from './pages/Employees';
import Areas from './pages/Areas';
import Shifts from './pages/Shifts';
import History from './pages/History';
import Settings from './pages/Settings';
import LoadingSkeleton from './components/LoadingSkeleton';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <CustomThemeProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="roster" element={<DutyRoster />} />
                <Route path="employees" element={<Employees />} />
                <Route path="areas" element={<Areas />} />
                <Route path="shifts" element={<Shifts />} />
                <Route path="history" element={<History />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </CustomThemeProvider>
    </AuthProvider>
  );
}
