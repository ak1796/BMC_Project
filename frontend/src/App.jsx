import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Shopkeeper Pages
import ShopkeeperOverview from './pages/ShopkeeperOverview';
import ShopkeeperHistory from './pages/ShopkeeperHistory';
import ShopkeeperFines from './pages/ShopkeeperFines';
import ShopkeeperBulky from './pages/ShopkeeperBulky';
import ShopkeeperAlert from './pages/ShopkeeperAlert';
import ShopkeeperSettings from './pages/ShopkeeperSettings';

// Admin Pages
import AdminOverview from './pages/AdminOverview';
import AdminAlerts from './pages/AdminAlerts';
import AdminShops from './pages/AdminShops';
import AdminFines from './pages/AdminFines';
import AdminReports from './pages/AdminReports';
import AdminQRGenerator from './pages/AdminQRGenerator';
import AdminSettings from './pages/AdminSettings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Shopkeeper Routes */}
          <Route element={<ProtectedRoute role="shopkeeper" />}>
            <Route path="/shopkeeper" element={<Navigate to="/shopkeeper/overview" replace />} />
            <Route path="/shopkeeper/overview" element={<ShopkeeperOverview />} />
            <Route path="/shopkeeper/history" element={<ShopkeeperHistory />} />
            <Route path="/shopkeeper/fines" element={<ShopkeeperFines />} />
            <Route path="/shopkeeper/bulky" element={<ShopkeeperBulky />} />
            <Route path="/shopkeeper/alert" element={<ShopkeeperAlert />} />
            <Route path="/shopkeeper/settings" element={<ShopkeeperSettings />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
            <Route path="/admin/overview" element={<AdminOverview />} />
            <Route path="/admin/alerts" element={<AdminAlerts />} />
            <Route path="/admin/shops" element={<AdminShops />} />
            <Route path="/admin/fines" element={<AdminFines />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/qr-generator" element={<AdminQRGenerator />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
