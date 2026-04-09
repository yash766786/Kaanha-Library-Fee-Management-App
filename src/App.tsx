import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Login from './pages/Login';
import ManagerDashboard from './pages/manager/Dashboard';
import OwnerValidate from './pages/owner/Validate';
import OwnerAnalytics from './pages/owner/Analytics';
import OwnerSettings from './pages/owner/Settings';
import Navbar from './components/Navbar';
import { useEffect, useState } from 'react';
import api from './lib/api';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
        {user && <Navbar user={user} setUser={setUser} />}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={user ? <Navigate to={user.role === 'owner' ? '/owner/analytics' : '/manager/dashboard'} /> : <Login setUser={setUser} />} />
            
            {/* Manager Routes */}
            <Route path="/manager/dashboard" element={user?.role === 'manager' ? <ManagerDashboard /> : <Navigate to="/login" />} />
            
            {/* Owner Routes */}
            <Route path="/owner/validate" element={user?.role === 'owner' ? <OwnerValidate /> : <Navigate to="/login" />} />
            <Route path="/owner/analytics" element={user?.role === 'owner' ? <OwnerAnalytics /> : <Navigate to="/login" />} />
            <Route path="/owner/settings" element={user?.role === 'owner' ? <OwnerSettings /> : <Navigate to="/login" />} />
            
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}
