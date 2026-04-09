import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { IndianRupee, TrendingUp, Calendar, Users, ArrowUpRight } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function OwnerAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!data) return <div className="text-center py-12 text-neutral-500">Failed to load analytics data.</div>;

  const filteredTransactions = selectedMonth === 'all' 
    ? data.allApproved 
    : data.allApproved.filter((t: any) => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return key === selectedMonth;
      });

  const months = Array.from(new Set(data.allApproved.map((t: any) => {
    const d = new Date(t.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }))).sort() as string[];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Analytics Dashboard</h1>
          <p className="text-neutral-500 mt-2">Overview of library fee collections.</p>
        </div>
        <div className="bg-white p-1 rounded-lg border border-neutral-200 flex items-center gap-2 px-3">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span className="text-sm font-medium text-neutral-600">{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Today's Collection
            </CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-1">
              <IndianRupee className="w-6 h-6" />
              {data.todayTotal.toLocaleString('en-IN')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-green-600 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              Updated just now
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Last 7 Days
            </CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-1">
              <IndianRupee className="w-6 h-6" />
              {data.weekTotal.toLocaleString('en-IN')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-neutral-500">Total from approved transactions</div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Total Transactions
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {data.allApproved.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-neutral-500">Approved payments recorded</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Collections</CardTitle>
            <CardDescription>Revenue growth over the past months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#888' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#888' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f5f5f5' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {data.chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === data.chartData.length - 1 ? '#171717' : '#a3a3a3'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Filter by Month</CardTitle>
            <CardDescription>View detailed transactions for a specific period.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                {months.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Summary</h4>
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-sm text-neutral-500">Count</span>
                <span className="text-sm font-medium">{filteredTransactions.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-sm text-neutral-500">Total Amount</span>
                <span className="text-sm font-bold flex items-center">
                  <IndianRupee className="w-3 h-3" />
                  {filteredTransactions.reduce((sum: number, t: any) => sum + t.amount, 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle>Approved Transactions</CardTitle>
          <CardDescription>List of all validated payments.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50">
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((t: any) => (
                <TableRow key={t._id}>
                  <TableCell className="font-medium">{t.studentName}</TableCell>
                  <TableCell>₹{t.amount}</TableCell>
                  <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Approved
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-neutral-500">
                    No transactions found for this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
