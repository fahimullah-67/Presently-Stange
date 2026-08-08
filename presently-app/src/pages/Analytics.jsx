import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Download, BarChart3 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', responses: 45, engagement: 78 },
  { name: 'Tue', responses: 52, engagement: 82 },
  { name: 'Wed', responses: 48, engagement: 75 },
  { name: 'Thu', responses: 61, engagement: 89 },
  { name: 'Fri', responses: 55, engagement: 85 },
];

export default function Analytics() {
  const [period, setPeriod] = useState('week');

  const kpis = [
    { label: 'Total Responses', value: '261', change: '+12%' },
    { label: 'Engagement Rate', value: '82%', change: '+5%' },
    { label: 'Attendees', value: '42', change: '+8' },
  ];

  const handleExportCSV = () => {
    const csv = 'Period,Responses,Engagement\n' + data.map(d => `${d.name},${d.responses},${d.engagement}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
              <p className="text-slate-600">Session performance insights</p>
            </div>
            <div className="flex gap-2">
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900">
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>
              <button onClick={handleExportCSV} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {kpis.map((kpi, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
                <p className="text-slate-600 text-sm">{kpi.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{kpi.value}</p>
                <p className="text-green-600 text-sm mt-2">{kpi.change}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Responses Over Time
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="responses" fill="#2D8CFF" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <LineChart3 className="w-5 h-5" />
                Engagement Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="engagement" stroke="#34C759" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
