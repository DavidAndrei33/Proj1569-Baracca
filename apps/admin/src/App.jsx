import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Orders from './pages/Orders.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ReservationsPage from './pages/ReservationsPage.jsx';
import TablesPage from './pages/TablesPage.jsx';

function PrivateRoute({ children }) {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  
  return isAuthenticated && isAdmin ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/meniu" element={<Products />} />
                <Route path="/comenzi" element={<Orders />} />
                <Route path="/rezervari" element={<ReservationsPage />} />
                <Route path="/mese" element={<TablesPage />} />
                <Route path="/rapoarte" element={<Reports />} />
                <Route path="/utilizatori" element={<UsersPage />} />
                <Route path="/setari" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AdminLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
