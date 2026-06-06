import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, loginError, loginLoading, clearError, isOperator } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin';

  useEffect(() => {
    if (isOperator) navigate(from, { replace: true });
  }, [isOperator]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const ok = await login(username, password);
    if (ok) navigate(from, { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-dart-dark to-gray-700 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-dart-red px-8 py-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🔐</span>
            </div>
            <div className="text-white font-black text-xl tracking-wide">OPERATOR ACCESS</div>
            <div className="text-red-200 text-xs mt-1">Authorised personnel only</div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dart-red focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dart-red focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-dart-red hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-3 rounded-lg transition-colors text-sm shadow-md flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <><span className="animate-spin">⏳</span> Signing in…</>
              ) : (
                'Sign In to Operator Dashboard'
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full text-gray-400 hover:text-gray-600 text-xs py-1 transition-colors"
            >
              ← Back to Passenger View
            </button>
          </form>
        </div>

        <div className="text-center text-gray-400 text-xs mt-4">
          Smart DART · Dar Rapid Transit System
        </div>
      </div>
    </div>
  );
}
