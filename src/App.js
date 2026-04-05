import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ComingSoon from './pages/ComingSoon';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><ComingSoon title="Đơn hàng" /></PrivateRoute>} />
      <Route path="/tables" element={<PrivateRoute><ComingSoon title="Quản lý bàn" /></PrivateRoute>} />
      <Route path="/menu" element={<PrivateRoute><ComingSoon title="Thực đơn" /></PrivateRoute>} />
      <Route path="/customers" element={<PrivateRoute><ComingSoon title="Khách hàng" /></PrivateRoute>} />
      <Route path="/staff" element={<PrivateRoute><ComingSoon title="Nhân viên" /></PrivateRoute>} />
      <Route path="/reservations" element={<PrivateRoute><ComingSoon title="Đặt bàn" /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
