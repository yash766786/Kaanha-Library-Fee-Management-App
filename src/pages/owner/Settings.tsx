import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCog, ShieldCheck, Save, User, Lock } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function OwnerSettings() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await api.patch('/settings/manager', { username, password });
      toast.success('Manager credentials updated successfully');
      setUsername('');
      setPassword('');
    } catch (err) {
      toast.error('Failed to update manager settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Settings</h1>
        <p className="text-neutral-500 mt-2">Manage library staff and system configurations.</p>
      </div>

      <Card className="border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Manager Account
          </CardTitle>
          <CardDescription>Update the username and password for the library manager.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="managerUsername">New Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input 
                  id="managerUsername" 
                  placeholder="Enter new username" 
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="managerPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input 
                  id="managerPassword" 
                  type="password" 
                  placeholder="Enter new password" 
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-neutral-900 hover:bg-neutral-800 h-11" 
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Save Manager Credentials'}
              <Save className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
        <div className="p-2 bg-blue-100 rounded-lg h-fit">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900">Security Note</h3>
          <p className="text-sm text-blue-700 mt-1 leading-relaxed">
            Changing manager credentials will take effect immediately. The manager will need to use the new credentials to log in. Ensure you communicate these changes securely to the staff member.
          </p>
        </div>
      </div>
    </div>
  );
}
