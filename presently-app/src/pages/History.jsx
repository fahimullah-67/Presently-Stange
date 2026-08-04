import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Download, Trash2, BarChart3, Search } from 'lucide-react';

export default function History() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const sessions = [
    { id: 1, name: 'Sales Webinar', date: '2 days ago', attendees: 42, polls: 8 },
    { id: 2, name: 'Team Meeting', date: '5 days ago', attendees: 15, polls: 3 },
    { id: 3, name: 'Product Launch', date: '1 week ago', attendees: 128, polls: 12 },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Session History</h1>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search sessions..."
                  className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-10 pr-4 text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900">
                <option value="all">All Sessions</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 text-slate-900 font-semibold">Session Name</th>
                  <th className="text-left p-4 text-slate-900 font-semibold hidden md:table-cell">Date</th>
                  <th className="text-left p-4 text-slate-900 font-semibold hidden sm:table-cell">Attendees</th>
                  <th className="text-left p-4 text-slate-900 font-semibold hidden sm:table-cell">Polls</th>
                  <th className="text-left p-4 text-slate-900 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-4 text-slate-900">{s.name}</td>
                    <td className="p-4 text-slate-600 hidden md:table-cell text-sm">{s.date}</td>
                    <td className="p-4 text-slate-600 hidden sm:table-cell text-sm">{s.attendees}</td>
                    <td className="p-4 text-slate-600 hidden sm:table-cell text-sm">{s.polls}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="text-primary hover:text-blue-700" title="Analyze">
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button className="text-primary hover:text-blue-700" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-700" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
