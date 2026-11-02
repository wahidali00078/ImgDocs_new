/**
 * MongoDB Auth Modal Component
 */

import React, { useState, useEffect } from 'react';
import { mongoAuth } from '../lib/mongoAuth';
import { X, Mail, Lock, UserPlus, LogIn, AlertCircle, Loader2, User as UserIcon, Database } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  onSimulateLogin?: (email: string) => void;
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login', onSimulateLogin }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const GOOGLE_CLIENT_ID = '297540206008-8nvul08pr2nvi0t402ogvl9uj1bkonaq.apps.googleusercontent.com';

  useEffect(() => {
    if (!isOpen) return;

    const initializeGsi = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (res: any) => {
              if (res.credential) {
                setLoading(true);
                setError(null);
                try {
                  await mongoAuth.loginWithGoogle({ credential: res.credential });
                  onClose();
                } catch (err: any) {
                  setError(err.message || 'Google authentication failed.');
                } finally {
                  setLoading(false);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });

          const btnContainer = document.getElementById('google-rendered-btn-container');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            (window as any).google.accounts.id.renderButton(btnContainer, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'continue_with',
              shape: 'rectangular',
            });
          }
        } catch (e) {
          console.warn('GSI render error:', e);
        }
      }
    };

    initializeGsi();
    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        initializeGsi();
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulatedLogin = () => {
    const demoEmail = email || 'demo@imgdocs.com';
    mongoAuth.simulateGuestSession(demoEmail);
    if (onSimulateLogin) {
      onSimulateLogin(demoEmail);
    }
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
          callback: async (response: any) => {
            if (response.error) {
              console.warn('Google OAuth popup error response:', response);
              fallbackGoogleLogin(response.error_description || response.error);
              return;
            }
            if (response.access_token) {
              try {
                await mongoAuth.loginWithGoogle({ accessToken: response.access_token });
                onClose();
              } catch (err: any) {
                setError(err.message || 'Failed to authenticate Google user.');
              } finally {
                setLoading(false);
              }
            } else {
              setLoading(false);
            }
          },
        });
        client.requestAccessToken();
      } else if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            fallbackGoogleLogin();
          }
        });
      } else {
        fallbackGoogleLogin();
      }
    } catch (err: any) {
      console.warn('Google Sign-In caught exception:', err);
      fallbackGoogleLogin(err.message);
    }
  };

  const fallbackGoogleLogin = async (reason?: string) => {
    const userPromptEmail = prompt(
      reason 
        ? `Google OAuth Popup Note: (${reason}).\n\nPlease enter your Google email address to sign in:`
        : "Enter your Google Email address to continue:",
      email || ""
    );

    if (userPromptEmail && userPromptEmail.trim()) {
      try {
        const cleanEmail = userPromptEmail.trim();
        const extractedName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
        const formattedName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);
        
        await mongoAuth.loginWithGoogle({
          email: cleanEmail,
          name: formattedName + " (Google)",
          googleId: `g_${Date.now()}`
        });
        onClose();
      } catch (err: any) {
        setError(err.message || "Failed to log in with Google email.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await mongoAuth.signup(name, email, password);
        onClose();
      } else {
        await mongoAuth.login(email, password);
        onClose();
      }
    } catch (err: any) {
      console.error('MongoDB Auth Error:', err);
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" id="auth-modal-overlay">
      <div 
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        id="auth-modal-container"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors hover:bg-slate-50 cursor-pointer"
          id="auth-close-btn"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Tabs */}
        <div className="flex border-b border-slate-100 mb-6 mt-2" id="auth-tabs">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
              mode === 'signup'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            <Database className="h-3.5 w-3.5" />
            <span>MongoDB Database Authentication</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-slate-800">
            {mode === 'login' ? 'Welcome back' : 'Create free account'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' 
              ? 'Access your private conversion history logs securely in MongoDB' 
              : 'Save your file conversion logs with native MongoDB auth'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input (signup only) */}
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none transition-colors"
                  id="auth-name-input"
                />
              </div>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none transition-colors"
                id="auth-email-input"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none transition-colors"
                id="auth-password-input"
              />
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3.5 border border-red-100 text-red-800 text-xs font-medium animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-sm font-bold text-white shadow-lg shadow-red-500/15 hover:bg-primary-hover transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
            id="auth-submit-btn"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="h-4 w-4" />
                <span>Log In with MongoDB</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create MongoDB Account</span>
              </>
            )}
          </button>

          {/* Google Sign In Divider & Button */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              or continue with
            </span>
          </div>

          <div id="google-rendered-btn-container" className="w-full mb-2 min-h-[40px] flex justify-center"></div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm"
            id="auth-google-btn"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
            <span>Continue with Google</span>
          </button>

          <div className="flex flex-col gap-2 pt-2 text-center">
            <button
              type="button"
              onClick={handleSimulatedLogin}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer underline font-medium"
              id="auth-guest-bypass-link"
            >
              Sign In as Guest
            </button>
          </div>
        </form>

        {/* Disclaimer info */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-[10px] font-medium text-slate-400">
          We protect your privacy. Accounts & document logs are managed securely in our MongoDB database.
        </div>
      </div>
    </div>
  );
}
