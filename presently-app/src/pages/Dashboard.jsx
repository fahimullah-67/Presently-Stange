import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Download, StopCircle, Users, MessageCircle, Send, ThumbsUp, Smile, ArrowLeftRight, Settings } from 'lucide-react';

export default function Dashboard() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'You', text: 'Welcome everyone!', timestamp: '10:02 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const attendees = [
    { id: 1, name: 'Alex M.', initials: 'AM', online: true },
    { id: 2, name: 'Sarah J.', initials: 'SJ', online: true },
    { id: 3, name: 'John D.', initials: 'JD', online: true },
    { id: 4, name: 'Emma R.', initials: 'ER', online: true },
    { id: 5, name: 'Michael T.', initials: 'MT', online: false },
    { id: 6, name: 'Lisa K.', initials: 'LK', online: true },
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        sender: 'You',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['Session Export - Presently'],
      ['Session ID', '#S12345'],
      ['Attendees', '42'],
      [],
      ['Chat Messages'],
      ...messages.map(m => [m.sender, m.text, m.timestamp]),
    ];

    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Live Session – Sales Webinar</h1>
              <p className="text-sm text-slate-600">#S12345</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live
              </div>
              <button onClick={handleExportCSV} className="bg-primary text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 flex items-center gap-2">
                <StopCircle className="w-4 h-4" />
                End Session
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="col-span-1 md:col-span-2 md:row-span-2 bg-slate-900 rounded-lg overflow-hidden border border-slate-200 h-48 md:h-auto flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 md:w-24 h-16 md:h-24 bg-gradient-to-br from-primary to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  You
                </div>
                <p className="text-white text-sm">Camera Feed</p>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 md:row-span-2 bg-white rounded-lg p-4 border border-slate-200 flex flex-col">
              <div className="flex gap-2 mb-4 border-b border-slate-200 pb-4">
                <button
                  onClick={() => setShowChat(false)}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                    !showChat ? 'bg-primary text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-1" />
                  Attendees
                </button>
                <button
                  onClick={() => setShowChat(true)}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                    showChat ? 'bg-primary text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Chat
                </button>
              </div>

              {!showChat ? (
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {attendees.map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-100">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${a.online ? 'bg-primary' : 'bg-slate-400'}`}>
                        {a.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 truncate">{a.name}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${a.online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {messages.map(msg => (
                      <div key={msg.id} className="bg-slate-100 rounded p-3">
                        <p className="text-xs font-semibold text-slate-900">{msg.sender}</p>
                        <p className="text-sm text-slate-900">{msg.text}</p>
                        <p className="text-xs text-slate-600 mt-1">{msg.timestamp}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type message..."
                      className="flex-1 bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-primary text-white p-2 rounded hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ThumbsUp, label: 'Yes/No Poll', color: 'from-primary to-blue-600' },
              { icon: Smile, label: 'Pulse Check', color: 'from-green-500 to-emerald-600' },
              { icon: ArrowLeftRight, label: 'This or That', color: 'from-purple-500 to-pink-600' },
              { icon: Settings, label: 'Custom Poll', color: 'from-gray-500 to-gray-600' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className={`bg-gradient-to-br ${item.color} rounded-lg p-4 text-white cursor-pointer hover:shadow-lg transition`}>
                  <Icon className="w-6 h-6 mb-2" />
                  <p className="font-semibold text-sm">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
