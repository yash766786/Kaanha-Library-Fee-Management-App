import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Plus, User, IndianRupee, FileText } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ManagerDashboard() {
  const [studentName, setStudentName] = useState('');
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !amount) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('studentName', studentName);
    formData.append('amount', amount);
    if (file) {
      formData.append('paymentProof', file);
    }

    try {
      await api.post('/transactions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Transaction added successfully');
      setStudentName('');
      setAmount('');
      setFile(null);
    } catch (err) {
      toast.error('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Manager Dashboard</h1>
        <p className="text-neutral-500 mt-2">Add new fee transactions for students.</p>
      </div>

      <Card className="border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Transaction
          </CardTitle>
          <CardDescription>Fill in the details below to record a payment.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="studentName">Student Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input 
                  id="studentName" 
                  placeholder="Enter student's full name" 
                  className="pl-10"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="Enter amount" 
                  className="pl-10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentProof">Payment Proof (Optional Screenshot)</Label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-200 rounded-lg cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-neutral-400" />
                    <p className="mb-2 text-sm text-neutral-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-neutral-400">PNG, JPG or JPEG (MAX. 5MB)</p>
                  </div>
                  <input 
                    id="paymentProof" 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept="image/*"
                  />
                </label>
              </div>
              {file && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-neutral-100 rounded-md text-sm text-neutral-600">
                  <FileText className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-neutral-900 hover:bg-neutral-800 h-11" 
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Add Transaction'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-12 p-6 bg-neutral-100 rounded-2xl border border-neutral-200">
        <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Manager Notice
        </h3>
        <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
          Transactions added here will be sent to the Owner for validation. Once approved, they will be reflected in the library's official analytics. Please ensure all details are accurate before submitting.
        </p>
      </div>
    </div>
  );
}
