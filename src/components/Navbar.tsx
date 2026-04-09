import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, CheckCircle, BarChart3, Settings, Library } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function Navbar({ user, setUser }: { user: any, setUser: any }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-neutral-900">
          <Library className="w-6 h-6 text-neutral-900" />
          <span>Kaanha Library</span>
        </Link>

        <div className="flex items-center gap-6">
          {user.role === 'manager' && (
            <Link to="/manager/dashboard" className="flex items-center gap-1 text-sm font-medium hover:text-neutral-600 transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}

          {user.role === 'owner' && (
            <>
              <Link to="/owner/validate" className="flex items-center gap-1 text-sm font-medium hover:text-neutral-600 transition-colors">
                <CheckCircle className="w-4 h-4" />
                Validate
              </Link>
              <Link to="/owner/analytics" className="flex items-center gap-1 text-sm font-medium hover:text-neutral-600 transition-colors">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
              <Link to="/owner/settings" className="flex items-center gap-1 text-sm font-medium hover:text-neutral-600 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </>
          )}

          <div className="h-6 w-px bg-neutral-200 mx-2" />

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
              {user.role}: {user.username || 'Owner'}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-neutral-600 hover:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
