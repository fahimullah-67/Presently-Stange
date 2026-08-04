import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Send, Search } from 'lucide-react';

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Sarah J.', text: 'Can we get a copy of the slides?', timestamp: '10:05 AM' },
    { id: 2, sender: 'Michael T.', text: 'Audio is coming in loud and clear here in Chicago!', timestamp: '10:08 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');

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

  const filteredMessages = messages.filter(m =>
    m.sender.toLowerCase().includes(search.toLowerCase()) ||
    m.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8 h-full flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Meeting Chat</h1>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search messages..."
                className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-10 pr-4 text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white rounded-lg border border-slate-200 p-4 mb-4 space-y-3">
            {filteredMessages.length === 0 ? (
              <p className="text-center text-slate-600 mt-8">No messages</p>
            ) : (
              filteredMessages.map(msg => (
                <div key={msg.id} className="bg-slate-100 rounded-lg p-4">
                  <p className="text-xs font-semibold text-slate-900">{msg.sender}</p>
                  <p className="text-sm text-slate-900 mt-1">{msg.text}</p>
                  <p className="text-xs text-slate-600 mt-2">{msg.timestamp}</p>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder:text-slate-400"
            />
            <button
              onClick={handleSendMessage}
              className="bg-primary text-white p-2 rounded-lg hover:bg-blue-700"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
