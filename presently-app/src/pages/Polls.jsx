import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Plus, ThumbsUp, Smile, ArrowLeftRight, Settings, Trash2 } from 'lucide-react';

export default function Polls() {
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState('');

  const handleCreatePoll = () => {
    if (question) {
      setPolls([...polls, { id: Date.now(), question }]);
      setQuestion('');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Polls</h1>
              <p className="text-slate-600">Create and manage live polls</p>
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              New Poll
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: ThumbsUp, label: 'Yes/No Poll', color: 'from-primary to-blue-600' },
              { icon: Smile, label: 'Pulse Check', color: 'from-green-500 to-emerald-600' },
              { icon: ArrowLeftRight, label: 'This or That', color: 'from-purple-500 to-pink-600' },
              { icon: Settings, label: 'Custom Poll', color: 'from-gray-500 to-gray-600' },
            ].map((template, i) => {
              const Icon = template.icon;
              return (
                <div key={i} className={`bg-gradient-to-br ${template.color} rounded-lg p-6 text-white cursor-pointer hover:shadow-lg transition`}>
                  <Icon className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold">{template.label}</h3>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Create New Poll</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter poll question..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder:text-slate-400"
              />
              <button
                onClick={handleCreatePoll}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Poll
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Active Polls</h2>
            {polls.length === 0 ? (
              <p className="text-slate-600">No polls created yet</p>
            ) : (
              <div className="space-y-2">
                {polls.map(poll => (
                  <div key={poll.id} className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                    <span className="text-slate-900">{poll.question}</span>
                    <button onClick={() => setPolls(polls.filter(p => p.id !== poll.id))} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
