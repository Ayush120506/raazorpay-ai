import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, MerchantUser, isFirebaseConfigured } from '../firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: MerchantUser) => void;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithEmail(email, password);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Email authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    try {
      const user = await loginWithEmail('merchant.demo@stylehub.store', 'DemoPassword123!');
      onSuccess(user);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#080808] border border-[#222] rounded-xl max-w-md w-full p-6 shadow-2xl overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#666] hover:text-white p-1 rounded hover:bg-[#161616] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded bg-[#141414] border border-[#222] text-orange-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_12px_rgba(234,88,12,0.15)]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-serif italic text-white tracking-wide">Merchant Dashboard Login</h3>
          <p className="text-xs text-[#777] mt-1">
            Sign in via Firebase Auth to manage your abandoned checkout recovery
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-950/40 border border-red-900/50 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {/* Quick Demo Access */}
          <button
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-[0_0_12px_rgba(234,88,12,0.3)] cursor-pointer transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Instant Demo Merchant Login (1-Click)</span>
          </button>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded bg-[#111] hover:bg-[#181818] text-[#CCC] border border-[#222] font-medium text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-[#222]"></div>
            <span className="px-3 text-[9px] text-[#666] uppercase tracking-widest font-mono">Or Email & Password</span>
            <div className="flex-1 border-t border-[#222]"></div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] text-[#777] mb-1">Merchant Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="store.admin@brand.com"
                className="w-full bg-[#050505] border border-[#222] rounded px-3 py-2 text-xs text-[#EEE] focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#777] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050505] border border-[#222] rounded px-3 py-2 text-xs text-[#EEE] focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-[#181818] hover:bg-[#222] text-white border border-[#282828] font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In with Email'}
            </button>
          </form>

          {!isFirebaseConfigured && (
            <div className="mt-3 text-[10px] text-[#666] text-center flex items-center justify-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              <span>Sandbox / Mock Auth mode active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
