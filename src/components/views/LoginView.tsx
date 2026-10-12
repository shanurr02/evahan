import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  CheckCircle2,
  Sparkles,
  Zap,
  Truck,
  Layers,
  Activity,
  UserCheck,
  Sun,
  Moon,
  HelpCircle,
  X,
  KeyRound,
  Database,
  BarChart3,
  Clock,
} from 'lucide-react';
import { TenantInfo, UserProfile, UserRole } from '../../types';

interface LoginViewProps {
  tenants: TenantInfo[];
  onLoginSuccess?: (user: UserProfile, tenantId: string) => void;
  onLogin?: (tenant: TenantInfo) => void;
  currentTheme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  tenants,
  onLoginSuccess,
  onLogin,
  currentTheme = 'light',
  onToggleTheme,
}) => {
  // Demo presets with instant 1-click login
  const demoPersonas: {
    role: UserRole;
    name: string;
    title: string;
    email: string;
    avatar: string;
    badgeColor: string;
    description: string;
  }[] = [
    {
      role: 'Super Admin',
      name: 'Ananya Sharma',
      title: 'VP of Fleet Operations & Masters Admin',
      email: 'a.sharma@fleetcommand.io',
      avatar: 'AS',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
      description: 'Unrestricted access to all 48 Masters, system config & user permissions',
    },
    {
      role: 'Operations',
      name: 'Rajesh Senapati',
      title: 'Head of Transport & Dispatch Operations',
      email: 'r.senapati@fleetcommand.io',
      avatar: 'RS',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      description: 'Trip dispatch, live GPS tracking, vehicle allocation & SLA monitoring',
    },
    {
      role: 'Finance',
      name: 'Debashis Roy',
      title: 'Finance & Freight Billing Controller',
      email: 'd.roy@fleetcommand.io',
      avatar: 'DR',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      description: 'Freight invoicing, FASTag reconciliation, trip advances & GST audit',
    },
    {
      role: 'Maintenance',
      name: 'Vikramjit Singh',
      title: 'Fleet Workshop & Asset Reliability Lead',
      email: 'v.singh@fleetcommand.io',
      avatar: 'VS',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      description: 'Service orders, tyre health, fitness renewals & maintenance checklists',
    },
  ];

  const [email, setEmail] = useState('r.senapati@fleetcommand.io');
  const [password, setPassword] = useState('FleetMaster@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Operations');
  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenants[0]?.id || 'tenant-1');
  const [isLoading, setIsLoading] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Single-Click Instant Demo Login Handler
  const handleSingleClickDemoLogin = (overridePersona?: (typeof demoPersonas)[0]) => {
    setIsLoading(true);
    const persona = overridePersona || demoPersonas[0]; // Default to Super Admin / Full Master Access

    setLoginFeedback(`Signing in as ${persona.name} (${persona.role})...`);

    setTimeout(() => {
      const user: UserProfile = {
        name: persona.name,
        email: persona.email,
        role: persona.role,
        tenantId: selectedTenantId,
      };

      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(user, selectedTenantId);
      }
      if (typeof onLogin === 'function') {
        const tenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];
        onLogin(tenant);
      }
      setIsLoading(false);
    }, 400);
  };

  // Standard Form Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLoginFeedback('Please enter your work email and password.');
      return;
    }

    setIsLoading(true);
    setLoginFeedback('Authenticating enterprise credentials...');

    setTimeout(() => {
      // Find matching persona or synthesize
      const matched = demoPersonas.find(
        (p) => p.email.toLowerCase() === email.trim().toLowerCase()
      );
      const user: UserProfile = {
        name: matched ? matched.name : email.split('@')[0].replace('.', ' ').toUpperCase(),
        email: email.trim(),
        role: matched ? matched.role : selectedRole,
        tenantId: selectedTenantId,
      };

      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(user, selectedTenantId);
      }
      if (typeof onLogin === 'function') {
        const tenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];
        onLogin(tenant);
      }
      setIsLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-zinc-100 transition-colors">
      {/* Top Mobile Bar / Corner Controls */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/80 shadow-xs backdrop-blur-xs text-slate-700 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={currentTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {currentTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>
        )}
      </div>

      {/* LEFT PANEL: Enterprise ERP Value Showcase (Desktop & Tablet) */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white relative overflow-hidden">
        {/* Subtle Background Accent Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Fleet Command</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30">
                  ERP v4.2
                </span>
              </div>
              <p className="text-xs text-blue-200/80 font-medium">
                AI-Powered Fleet Management & Transport ERP
              </p>
            </div>
          </div>

          <div className="mt-12 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-300 text-xs font-semibold mb-4">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Inspired by Fleetx.ai Enterprise Standard</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Unified Masters & Real-Time Logistics Control Tower
            </h1>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Consolidate 48 operational master entities across Organization, Fleet, Parties, Commercial Rates, 
              Compliance and Telematics into a single, high-performance ERP workspace.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="mt-8 grid grid-cols-2 gap-3 max-w-lg">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold">
                <Database className="h-4 w-4" />
                <span>Unified Masters</span>
              </div>
              <div className="mt-2 text-2xl font-black text-white font-mono-num">48 Modules</div>
              <p className="text-[11px] text-slate-300 mt-0.5">Across 10 functional business groups</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                <Activity className="h-4 w-4" />
                <span>Live GPS Telematics</span>
              </div>
              <div className="mt-2 text-2xl font-black text-white font-mono-num">AIS-140</div>
              <p className="text-[11px] text-slate-300 mt-0.5">Sub-second vehicle telemetry</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                <Layers className="h-4 w-4" />
                <span>Connected Fleet</span>
              </div>
              <div className="mt-2 text-2xl font-black text-white font-mono-num">1,420+ Trucks</div>
              <p className="text-[11px] text-slate-300 mt-0.5">Tata, BharatBenz, Ashok Leyland</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
                <BarChart3 className="h-4 w-4" />
                <span>On-Time Delivery SLA</span>
              </div>
              <div className="mt-2 text-2xl font-black text-white font-mono-num">98.4%</div>
              <p className="text-[11px] text-slate-300 mt-0.5">Automated detention calculation</p>
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges & Security Notice */}
        <div className="relative z-10 pt-6 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Multi-Tenant RBAC</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>FASTag & Fuel Reconciliation</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Automated RTO Compliance</span>
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            <span>End-to-End Enterprise Encryption (AES-256) • SOC-2 & ISO 27001 Certified</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Form & Single-Click Demo Login */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo & Title */}
          <div className="lg:hidden text-center mb-2">
            <div className="inline-flex h-11 w-11 rounded-xl bg-blue-600 items-center justify-center text-white shadow-md shadow-blue-600/30 mb-2">
              <Truck className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Fleet Command ERP
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              AI-Powered Fleet Management & Transport Operations
            </p>
          </div>

          {/* Form Card Header */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Sign In to Workstation
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300">
                <ShieldCheck className="h-3 w-3" />
                AIS-140 Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Select one-click demo access to explore all 48 masters or sign in with corporate credentials.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* PROMINENT SINGLE-CLICK DEMO LOGIN BUTTON (Highlighted with Banner)       */}
          {/* ========================================================================= */}
          <div className="rounded-xl border-2 border-blue-500/40 bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-white dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-zinc-900 p-4.5 shadow-md shadow-blue-500/5 relative overflow-hidden transition-all hover:border-blue-500">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9.5px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-bl-lg flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              <span>Recommended</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/30">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Instant Demo Access
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  Launch the complete ERP with 1-click. No typing, password, or sign-up needed.
                </p>
              </div>
            </div>

            {/* THE PRIMARY SINGLE BUTTON DEMO LOGIN */}
            <button
              type="button"
              id="single-button-demo-login"
              onClick={() => handleSingleClickDemoLogin()}
              disabled={isLoading}
              className="mt-3.5 w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Entering Fleet Command...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-white" />
                  <span className="text-sm tracking-wide">Single-Click Demo Login</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </div>

          {/* Quick Persona Logins (Role Switcher) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Or One-Click As Specific Role:
              </span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">Instant Switch</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoPersonas.map((persona) => (
                <button
                  key={persona.role}
                  type="button"
                  onClick={() => handleSingleClickDemoLogin(persona)}
                  disabled={isLoading}
                  className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-600 dark:hover:bg-blue-950/20 text-left transition-all cursor-pointer group disabled:opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {persona.name}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${persona.badgeColor}`}>
                      {persona.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate mt-1">
                    {persona.title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-zinc-800 w-full" />
            <span className="bg-slate-50 dark:bg-[#07090e] px-3 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Corporate Credentials
            </span>
          </div>

          {/* Feedback or error message */}
          {loginFeedback && (
            <div className="rounded-lg p-2.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900 flex items-center justify-between">
              <span>{loginFeedback}</span>
              <button
                type="button"
                onClick={() => setLoginFeedback(null)}
                className="text-blue-400 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            {/* Enterprise Tenant / Branch Selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                Branch / Regional Hub
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                  <Building2 className="h-4 w-4" />
                </div>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code} - {t.fleetSize} assets)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                  Work Email Address
                </label>
                <button
                  type="button"
                  onClick={() => setEmail('r.senapati@fleetcommand.io')}
                  className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Fill Demo Email
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="operator@fleetcommand.io"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                  Security Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 transition-colors font-mono-num"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                />
                <span className="text-xs text-slate-600 dark:text-zinc-400">
                  Remember this workstation (30 days)
                </span>
              </label>
            </div>

            {/* Standard Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" />
              <span>Sign In with Credentials</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </form>

          {/* Footer Information */}
          <div className="pt-4 text-center text-[11px] text-slate-400 dark:text-zinc-500 space-y-1">
            <p>Protected by AIS-140 compliance protocols & TLS 1.3 encryption.</p>
            <p>Fleet Command ERP • Standard Master Data Architecture</p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                  <KeyRound className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Password Recovery
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {forgotSent ? (
              <div className="py-4 text-center space-y-2">
                <div className="h-10 w-10 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  Reset Link Dispatched
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                  A secure 6-digit recovery OTP has been sent to your registered enterprise email address.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="mt-3 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  Enter your registered enterprise work email to receive password reset instructions.
                </p>
                <div>
                  <input
                    type="email"
                    value={forgotEmail || email}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="operator@fleetcommand.io"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotSent(true)}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs"
                  >
                    Send Recovery OTP
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
