import { Link } from 'react-router-dom';
import { ArrowRight, Zap, BarChart3, Users } from 'lucide-react';

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Side */}
        <div className="bg-gradient-to-br from-primary to-blue-700 text-white p-8 md:p-12 flex flex-col justify-between items-start hidden lg:flex">
          <div>
            <h2 className="text-3xl font-bold mb-2">Presently</h2>
            <p className="text-sm opacity-90">Live Interaction Platform</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Engage Your Audience</h3>
                <p className="text-sm opacity-90">Live polls, Q&A, real-time feedback</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <BarChart3 className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Real-Time Analytics</h3>
                <p className="text-sm opacity-90">Track engagement instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Users className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Manage Attendees</h3>
                <p className="text-sm opacity-90">See who's present and engaged</p>
              </div>
            </div>
          </div>

          <p className="text-xs opacity-75">© 2024 Presently</p>
        </div>

        {/* Right Side */}
        <div className="bg-white p-8 md:p-12 flex flex-col justify-center items-center">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Presently</h1>
            <p className="text-slate-600 mb-8">Live Interaction Platform for modern meetings and webinars</p>

            <div className="space-y-3 mb-8">
              <Link
                to="/auth"
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/auth"
                className="w-full border border-slate-300 text-slate-900 py-3 px-4 rounded-lg font-semibold hover:bg-slate-50 transition"
              >
                Sign In
              </Link>
            </div>

            <div className="border-t border-slate-300 pt-8">
              <p className="text-xs text-slate-600 mb-4 font-semibold">FEATURES</p>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Live polls and Q&A
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Real-time chat
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Analytics dashboard
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Attendee management
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
