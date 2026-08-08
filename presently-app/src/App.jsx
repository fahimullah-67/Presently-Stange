import { Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import GmailLogin from "./pages/GmailLogin";
import Dashboard from "./pages/Dashboard";
import Polls from "./pages/Polls";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import History from "./pages/History";
import Billing from "./pages/Billing";
import ZoomMeeting from "./components/ZoomMeeting";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/gmail-login" element={<GmailLogin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/polls" element={<Polls />} />
      <Route path="/dashboard/chat" element={<Chat />} />
      <Route path="/dashboard/analytics" element={<Analytics />} />
      <Route path="/dashboard/settings" element={<Settings />} />
      <Route path="/dashboard/history" element={<History />} />
      <Route path="/dashboard/billing" element={<Billing />} />
      <Route path="/zoom/:meetingId" element={<ZoomMeeting />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
