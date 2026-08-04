import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Check } from 'lucide-react';

export default function Billing() {
  const [plan, setPlan] = useState('pro');

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$29',
      period: '/month',
      features: ['Up to 50 attendees', '5 polls/session', 'Basic analytics', 'Email support'],
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '$79',
      period: '/month',
      features: ['Unlimited attendees', 'Unlimited polls', 'Advanced analytics', 'Priority support', 'Custom branding'],
      current: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: ['Everything in Pro', 'Dedicated account manager', 'API access', 'SLA guaranteed', 'Custom integrations'],
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
            <p className="text-slate-600">Manage your subscription and payments</p>
          </div>

          <div className="bg-gradient-to-r from-primary to-blue-700 text-white rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-2">Professional Plan</h2>
            <p className="opacity-90 mb-4">You are currently on the Professional plan</p>
            <button className="bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90">
              Change Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map(p => (
              <div key={p.id} className={`rounded-lg border-2 p-6 transition-all ${
                p.current ? 'border-primary bg-secondary/20' : 'border-slate-200 bg-white'
              }`}>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{p.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-slate-900">{p.price}</span>
                  {p.period && <span className="text-slate-600">{p.period}</span>}
                </div>
                <button className={`w-full py-2 px-4 rounded-lg font-semibold mb-6 transition ${
                  p.current ? 'bg-primary text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}>
                  {p.current ? 'Current Plan' : 'Switch Plan'}
                </button>
                <ul className="space-y-3">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-slate-900 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Billing History</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-4 text-slate-900 font-semibold">Date</th>
                  <th className="text-left p-4 text-slate-900 font-semibold">Description</th>
                  <th className="text-left p-4 text-slate-900 font-semibold">Amount</th>
                  <th className="text-left p-4 text-slate-900 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-4 text-slate-600">Aug 3, 2024</td>
                  <td className="p-4 text-slate-900">Professional Plan</td>
                  <td className="p-4 text-slate-900">$79.00</td>
                  <td className="p-4"><span className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs">Paid</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
