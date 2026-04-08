import { BarChart3, CreditCard, CheckCircle2, Clock } from 'lucide-react';
import { PaymentHistory } from '../types';

interface UsageStatsProps {
  monthlyCount: number;
  totalCount: number;
  payments: PaymentHistory[];
}

export default function UsageStats({ monthlyCount, totalCount, payments }: UsageStatsProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Usage & Billing</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <BarChart3 size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Monthly Reports</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{monthlyCount}</span>
              <span className="text-slate-400 text-sm font-medium">this month</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600">
            <CreditCard size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Reports</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{totalCount}</span>
              <span className="text-slate-400 text-sm font-medium">all time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Payment & Credit History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Report Count</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map((payment, idx) => (
                <tr key={idx} className="text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{payment.date}</td>
                  <td className="px-6 py-4">{payment.reportCount} Reports</td>
                  <td className="px-6 py-4 font-bold text-slate-900">${payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      payment.status === 'Paid' 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {payment.status === 'Paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
