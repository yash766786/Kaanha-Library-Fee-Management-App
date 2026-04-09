import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Library, Lock, User as UserIcon } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function Login({ setUser }: { setUser: any }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (role: 'manager' | 'owner') => {
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password, role });
      setUser(res.data);
      toast.success(`Logged in as ${role}`);
      navigate(role === 'owner' ? '/owner/analytics' : '/manager/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md border-neutral-200 shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-neutral-900 rounded-2xl">
              <Library className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Kaanha Library</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manager" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="manager">Manager</TabsTrigger>
              <TabsTrigger value="owner">Owner</TabsTrigger>
            </TabsList>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input 
                    id="username" 
                    placeholder="Enter username" 
                    className="pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter password" 
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <TabsContent value="manager" className="mt-6">
              <Button 
                className="w-full bg-neutral-900 hover:bg-neutral-800" 
                onClick={() => handleLogin('manager')}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login as Manager'}
              </Button>
            </TabsContent>
            
            <TabsContent value="owner" className="mt-6">
              <Button 
                className="w-full bg-neutral-900 hover:bg-neutral-800" 
                onClick={() => handleLogin('owner')}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login as Owner'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-2 text-sm text-neutral-500">
          <span>Secure Fee Management System</span>
        </CardFooter>
      </Card>
    </div>
  );
}
