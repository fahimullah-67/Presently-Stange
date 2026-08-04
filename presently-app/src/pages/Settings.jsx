import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { User, Bell, Lock, Users, Shield } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Shield },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-8">Settings</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="flex lg:flex-col gap-2 lg:col-span-1 overflow-x-auto lg:overflow-x-visible">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap lg:whitespace-normal transition ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'bg-white border border-slate-300 text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900">Profile Settings</h2>
                    <div>
                      <label className="text-sm font-medium text-slate-900 block mb-2">Full Name</label>
                      <input type="text" defaultValue="John Doe" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-900" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-900 block mb-2">Email</label>
                      <input type="email" defaultValue="john@example.com" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-900" />
                    </div>
                    <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700">Save Changes</button>
                  </div>
                )}
                {activeTab === 'notifications' && <p className="text-slate-900">Notification settings coming soon</p>}
                {activeTab === 'security' && <p className="text-slate-900">Security settings coming soon</p>}
                {activeTab === 'team' && <p className="text-slate-900">Team management coming soon</p>}
                {activeTab === 'integrations' && <p className="text-slate-900">Integrations coming soon</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
