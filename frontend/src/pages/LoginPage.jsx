import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, Shield, Route } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';

const demoAccounts = [
  { label: 'Admin (Chief Executive Engineer)', email: 'admin@roadsetu.gov.in', password: 'Admin@123', role: 'ADMIN', color: 'border-[#123B5D] bg-[#123B5D]/5 hover:bg-[#123B5D]/10' },
  { label: 'Field Inspector', email: 'inspector.patel@roadsetu.gov.in', password: 'Inspector@123', role: 'FIELD_INSPECTOR', color: 'border-[#1976A5] bg-[#1976A5]/5 hover:bg-[#1976A5]/10' },
  { label: 'Maintenance Officer', email: 'engineer.sharma@roadsetu.gov.in', password: 'Officer@123', role: 'MAINTENANCE_OFFICER', color: 'border-[#D89B24] bg-[#D89B24]/5 hover:bg-[#D89B24]/10' },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B1F33]">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Top logo */}
        <div className="relative z-10">
          <Logo size="lg" light />
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-8 max-w-lg">
          <div>
            <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
              Government Road &<br />
              Transportation Infrastructure<br />
              <span className="text-[#D89B24]">Asset Lifecycle Management</span>
            </h1>
            <p className="text-slate-400 mt-4 text-base leading-relaxed">
              Centralized end-to-end infrastructure inventory system for tracking and managing
              Roads, Highways, and Bridges across their complete lifecycle — from registration
              through inspection, maintenance, rehabilitation, and retirement.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Route, label: 'Roads & Highways', count: '18+' },
              { icon: Shield, label: 'Bridge Monitoring', count: '7+' },
              { icon: LogIn, label: 'RBAC Protected', count: '3 Roles' },
            ].map((f, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <f.icon className="w-5 h-5 text-[#D89B24] mb-2" />
                <p className="text-white text-sm font-semibold">{f.count}</p>
                <p className="text-slate-400 text-[11px]">{f.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} RoadSetu · Government of Gujarat · Roads & Buildings Department
          </p>
        </div>

        {/* Decorative bridge */}
        <div className="absolute bottom-0 right-0 w-[400px] h-[200px] opacity-[0.04]">
          <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0 180C80 60 320 60 400 180" stroke="white" strokeWidth="6"/>
            <line x1="80" y1="90" x2="80" y2="180" stroke="white" strokeWidth="3"/>
            <line x1="200" y1="68" x2="200" y2="180" stroke="white" strokeWidth="3"/>
            <line x1="320" y1="90" x2="320" y2="180" stroke="white" strokeWidth="3"/>
            <line x1="0" y1="180" x2="400" y2="180" stroke="white" strokeWidth="6"/>
          </svg>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#F4F7F9]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex justify-center mb-3">
              <Logo size="lg" />
            </div>
            <p className="text-sm text-charcoal-500">Government Transportation Infrastructure Management</p>
          </div>

          <div className="bg-white rounded-xl shadow-card border border-charcoal-200 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-navy-900">Sign In</h2>
              <p className="text-sm text-charcoal-500 mt-1">Access the Infrastructure Asset Management System</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-800 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-charcoal-200 bg-charcoal-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1976A5]/40 focus:border-[#1976A5] transition-all"
                    placeholder="admin@roadsetu.gov.in"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-charcoal-200 bg-charcoal-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1976A5]/40 focus:border-[#1976A5] transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-navy-800 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-navy-900 hover:bg-navy-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In to Platform
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Demo Environment Quick Access */}
          <div className="mt-6 bg-white rounded-xl shadow-subtle border border-charcoal-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-govSuccess animate-pulse" />
              <span className="text-xs font-bold text-navy-800 uppercase tracking-wider">Demo Environment</span>
            </div>
            <div className="space-y-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleDemoLogin(account)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all ${account.color}`}
                >
                  <span className="text-navy-800">{account.label}</span>
                  <span className="text-charcoal-500 text-[10px] font-mono">{account.role}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-charcoal-500 mt-2.5">Click any role to auto-fill credentials, then press Sign In.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
