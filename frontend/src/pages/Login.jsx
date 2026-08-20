import React, { useState, useEffect } from 'react';
import { Pill, KeyRound, Mail, RefreshCw, AlertCircle, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchCaptcha, loginUser } from '../api';

export default function Login({ onNavigateSignup, onLoginSuccess }) {
  const { login } = useAuth();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  
  const [captchaData, setCaptchaData] = useState({ captchaId: '', svg: '' });
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCaptcha = async () => {
    setLoadingCaptcha(true);
    try {
      const data = await fetchCaptcha();
      setCaptchaData(data);
      setCaptchaInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId || !password || !captchaInput) {
      setError('Please fill in all fields including the Captcha verification.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await loginUser({
        loginId,
        password,
        captchaId: captchaData.captchaId,
        captchaInput
      });

      login(res.user, res.token);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Login failed.');
      loadCaptcha(); // Reset captcha on error
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    const demoEmail = role === 'admin' ? 'admin@medstore.com' : 'user@medstore.com';
    setLoginId(demoEmail);
    setPassword('password123');
    // Pre-fill captcha from current SVG text if available
    try {
      const res = await loginUser({
        loginId: demoEmail,
        password: 'password123',
        captchaId: captchaData.captchaId,
        captchaInput: 'SKIP' // Backend fallback for demo
      });
      login(res.user, res.token);
      onLoginSuccess(res.user);
    } catch (e) {
      // Fallback standard submit
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-teal-600 to-emerald-400 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-teal-600/30">
            <Pill className="w-8 h-8 rotate-45" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Welcome Back</h2>
          <p className="text-xs text-slate-500">Log in with Email/Phone & Captcha verification</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email / Phone Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email or Phone Number</label>
            <div className="relative">
              <input
                type="text"
                placeholder="email@example.com or 9876543210"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all"
                required
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Captcha Verification Section */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700">Security Captcha</label>
            
            <div className="flex items-center gap-3">
              {/* Captcha Image */}
              <div 
                className="bg-white rounded-xl p-1 shadow-sm border border-slate-200 overflow-hidden flex items-center justify-center min-w-[150px] min-h-[50px]"
                dangerouslySetInnerHTML={{ __html: captchaData.svg }}
              />
              
              <button
                type="button"
                onClick={loadCaptcha}
                disabled={loadingCaptcha}
                className="p-2.5 bg-white text-slate-600 hover:text-teal-600 rounded-xl border border-slate-200 shadow-sm transition-colors"
                title="Refresh Captcha"
              >
                <RefreshCw className={`w-4 h-4 ${loadingCaptcha ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Enter 5-character Captcha"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono tracking-wider focus:ring-2 focus:ring-teal-500 outline-none uppercase"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <p className="text-[11px] text-center text-slate-400 font-semibold uppercase tracking-wider">Quick Demo Login</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 transition-colors"
            >
              👤 Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200 transition-colors"
            >
              ⚡ Demo Admin
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <button
            onClick={onNavigateSignup}
            className="font-bold text-teal-600 hover:underline"
          >
            Sign up here
          </button>
        </p>

      </div>
    </div>
  );
}
