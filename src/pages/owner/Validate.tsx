import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, Eye, X, IndianRupee, Clock, User } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function OwnerValidate() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions/pending');
      setTransactions(res.data);
    } catch (err) {
      toast.error('Failed to fetch pending transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/transactions/${id}/approve`);
      toast.success('Transaction approved');
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      toast.error('Failed to approve transaction');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Validate Transactions</h1>
        <p className="text-neutral-500 mt-2">Review and approve pending fee payments.</p>
      </div>

      <Card className="border-neutral-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-neutral-100">
          <CardTitle>Pending Approval</CardTitle>
          <CardDescription>You have {transactions.length} transactions waiting for your review.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mb-4">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900">All caught up!</h3>
              <p className="text-neutral-500">No pending transactions to validate.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead className="w-[200px]">Student Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t._id} className="hover:bg-neutral-50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-neutral-400" />
                        {t.studentName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-semibold">
                        <IndianRupee className="w-3 h-3" />
                        {t.amount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-neutral-500 text-sm">
                        <Clock className="w-3 h-3" />
                        {new Date(t.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-500 text-sm">{t.createdBy?.username}</TableCell>
                    <TableCell>
                      {t.paymentProof ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                              <Eye className="w-3 h-3" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Payment Proof - {t.studentName}</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 rounded-lg overflow-hidden border border-neutral-200">
                              <img 
                                src={t.paymentProof} 
                                alt="Payment Proof" 
                                className="w-full h-auto"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">No proof</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 h-8 px-3"
                          onClick={() => handleApprove(t._id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
