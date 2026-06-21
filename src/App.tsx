import { Navigate, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from './store/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Wizard from './pages/Wizard';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* Home is public — no auth required */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
      </Route>
      {/* Wizard & Settings require login */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/wizard" element={<Wizard />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
