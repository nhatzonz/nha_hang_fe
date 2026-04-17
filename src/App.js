import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import StaffList from './pages/Staff/StaffList';
import MenuList from './pages/Menu/MenuList';
import TableList from './pages/Tables/TableList';
import CustomerList from './pages/Customers/CustomerList';
import OrderList from './pages/Orders/OrderList';
import CreateOrder from './pages/Orders/CreateOrder';
import OrderDetail from './pages/Orders/OrderDetail';
import Reports from './pages/Reports/Reports';
import ReservationList from './pages/Reservations/ReservationList';
import ProfilePage from './pages/Profile/ProfilePage';
import SettingsPage from './pages/Settings/SettingsPage';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const ManagerRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin' && user?.role !== 'manager') return <Navigate to="/dashboard" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/staff" element={<ManagerRoute><StaffList /></ManagerRoute>} />
      <Route path="/menu" element={<PrivateRoute><MenuList /></PrivateRoute>} />
      <Route path="/tables" element={<PrivateRoute><TableList /></PrivateRoute>} />
      <Route path="/customers" element={<PrivateRoute><CustomerList /></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><OrderList /></PrivateRoute>} />
      <Route path="/orders/create" element={<PrivateRoute><CreateOrder /></PrivateRoute>} />
      <Route path="/orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
      <Route path="/reports" element={<ManagerRoute><Reports /></ManagerRoute>} />
      <Route path="/reservations" element={<PrivateRoute><ReservationList /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </Router>
  );
}

export default App;
