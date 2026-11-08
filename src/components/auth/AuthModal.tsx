import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { validatePasswordStrength } from '../../utils/productivity.ts';
import {
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendResetEmail,
    continueAsGuest,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const passwordStrength = validatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    if (mode === 'reset') {
      const res = await sendResetEmail(email);
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg('Password reset instructions have been dispatched to your email.');
      } else {
        setErrorMsg(res.error || 'Failed to dispatch reset email.');
      }
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setIsLoading(false);
        setErrorMsg('Passwords do not match. Please verify your entries.');
        return;
      }
      if (!passwordStrength.isValid) {
        setIsLoading(false);
        setErrorMsg('Password does not satisfy security criteria. Minimum 8 characters with numbers or symbols.');
        return;
      }
      const res = await signUpWithEmail(email, password);
      setIsLoading(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
      return;
    }

    // Sign in mode
    const res = await signInWithEmail(email, password);
    setIsLoading(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Sign in failed.');
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    const res = await signInWithGoogle();
    setIsLoading(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Google authentication failed.');
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0A1128] border border-cyan-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100 cyber-glow-sm">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <ShieldCheck className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Vasisox Nexus AI
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                Auth
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'signin' && 'Sign in to sync your productivity matrix across devices.'}
              {mode === 'signup' && 'Create your secured Nexus cloud account.'}
              {mode === 'reset' && 'Reset your account security credentials.'}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        {mode !== 'reset' && (
          <div className="grid grid-cols-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800 mb-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition ${
                mode === 'signin'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commander@nexus.io"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setErrorMsg(null);
                    }}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter on Signup */}
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Strength:</span>
                    <span
                      className={`font-semibold ${
                        passwordStrength.label === 'Strong'
                          ? 'text-emerald-400'
                          : passwordStrength.label === 'Good'
                          ? 'text-cyan-400'
                          : passwordStrength.label === 'Fair'
                          ? 'text-yellow-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score >= 1 ? 'bg-rose-500 w-1/4' : 'w-0'
                      }`}
                    />
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score >= 2 ? 'bg-yellow-500 w-1/4' : 'w-0'
                      }`}
                    />
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score >= 3 ? 'bg-cyan-500 w-1/4' : 'w-0'
                      }`}
                    />
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score >= 4 ? 'bg-emerald-400 w-1/4' : 'w-0'
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Use 8+ chars with uppercase, lowercase, numbers &amp; symbols.
                  </p>
                </div>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : mode === 'signin' ? (
              <>
                Sign In to Nexus <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'signup' ? (
              <>
                Register Account <Sparkles className="w-4 h-4" />
              </>
            ) : (
              'Send Password Reset Link'
            )}
          </button>
        </form>

        {/* Google Sign In option */}
        {mode !== 'reset' && (
          <>
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-slate-800" />
              <span className="px-3 text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                or continue with
              </span>
              <div className="flex-1 border-t border-slate-800" />
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-850 text-slate-200 text-xs font-semibold flex items-center justify-center gap-3 transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign In with Google
            </button>
          </>
        )}

        {/* Footer Navigation */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          {mode === 'reset' ? (
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              Back to Sign In
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGuest}
              className="text-slate-400 hover:text-cyan-400 transition"
            >
              Continue as Guest (Local Storage)
            </button>
          )}

          <span className="text-[11px] text-slate-500 font-mono">
            Encrypted &bull; 256-bit
          </span>
        </div>
      </div>
    </div>
  );
};
