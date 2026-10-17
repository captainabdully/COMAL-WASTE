import { useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Eye, EyeOff, LayoutDashboard, Languages, Loader2, LogOut, Menu, Plus, X } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useUI } from './UI';
import { useLanguage } from '../i18n/LanguageContext';
import logo from '../assets/logo.png';

export const inputCls = 'w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400';
export const cardCls = 'bg-white rounded-[2rem] border border-slate-100 shadow-sm';
export const btnCls = 'inline-flex items-center justify-center gap-2 rounded-full bg-green-700 text-white font-semibold px-6 py-3 transition-all duration-300 hover:bg-green-800 hover:shadow-lg hover:shadow-green-700/30 disabled:opacity-60 disabled:hover:shadow-none';
export const ghostBtnCls = 'inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-slate-700 font-semibold px-5 py-2.5 transition-all duration-300 hover:bg-slate-50';

export function LanguageToggle({ dark = false }) {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center gap-1">
      <Languages className={`w-[18px] h-[18px] ${dark ? 'text-slate-300' : 'text-slate-500'}`} />
      {[['en', 'EN', 'Switch to English'], ['sw', 'SW', 'Badilisha hadi Kiswahili']].map(([code, label, aria]) => {
        const on = language === code;
        return (
          <button key={code} type="button" aria-label={aria} aria-pressed={on} onClick={() => setLanguage(code)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${on ? 'bg-green-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</button>
        );
      })}
    </div>
  );
}

export function ErrorBox({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 mb-4 text-sm">
      <AlertCircle className="w-5 h-5 shrink-0" /><p className="flex-1">{children}</p>
    </div>
  );
}

export function PasswordInput({ value, onChange, placeholder, autoComplete, label }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block mb-4">
      {label && <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>}
      <span className="relative block">
        <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} className={`${inputCls} pr-12`} />
        <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800">
          {show ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>
      </span>
    </label>
  );
}

export function Field({ label, children }) {
  return <label className="block mb-4"><span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>{children}</label>;
}

export function PrimaryButton({ loading, children, className = '', ...props }) {
  return (
    <button {...props} disabled={loading || props.disabled} className={`${btnCls} ${className}`}>
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}{children}
    </button>
  );
}

export const PageLoader = () => <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-9 h-9 animate-spin text-green-700" /></div>;

export const AuthLink = ({ to, children, className = '' }) => <Link to={to} className={`text-green-700 font-medium hover:underline ${className}`}>{children}</Link>;

// Split-screen layout for sign in / sign up / password recovery.
export function AuthLayout() {
  const { user } = useAuth();
  if (user) return <Navigate to="/app" replace />;
  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-sans text-slate-900 selection:bg-green-100 selection:text-green-900">
      <aside className="hidden lg:flex relative overflow-hidden bg-slate-900 text-white p-12 flex-col justify-between">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-green-700/40 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-yellow-400/30 blur-[120px]" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center"><LayoutDashboard className="w-5 h-5" /></span>
          <span className="text-xl font-bold">Skrepa Chap</span>
        </Link>
        <div className="relative">
          <img src={logo} alt="" className="w-40 h-40 object-contain mb-8" />
          <h2 className="text-4xl font-bold tracking-tight leading-tight">Turn your scrap into <span className="text-yellow-400">instant cash</span></h2>
          <p className="mt-4 text-slate-300 max-w-md">Check daily prices, request pickups and follow every order — the same account you use on the mobile app.</p>
        </div>
        <p className="relative text-sm text-slate-400">© {new Date().getFullYear()} Country Material Limited</p>
      </aside>
      <main className="relative flex items-center justify-center px-5 py-12 bg-white">
        <div className="absolute top-5 right-5 flex items-center gap-4"><LanguageToggle /></div>
        <Link to="/" className="absolute top-5 left-5 lg:hidden flex items-center gap-2 font-bold"><span className="w-9 h-9 rounded-xl bg-green-700 text-white flex items-center justify-center"><LayoutDashboard className="w-4 h-4" /></span>Skrepa Chap</Link>
        <div className="w-full max-w-md mt-8 lg:mt-0"><Outlet /></div>
      </main>
    </div>
  );
}

export function AuthForm({ title, subtitle, onSubmit, children, back }) {
  const navigate = useNavigate();
  return (
    <form onSubmit={onSubmit} noValidate>
      {back && <button type="button" onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft className="w-4 h-4" />Back</button>}
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 mb-6 text-slate-600">{subtitle}</p>}
      {!subtitle && <div className="mb-6" />}
      {children}
    </form>
  );
}

const nav = (t) => [['/app', t('pickupRequests'), true], ['/app/daily-prices', t('dailyPrices')], ['/app/profile', 'Profile']];

export function ProtectedLayout() {
  const { user, logout } = useAuth();
  const ui = useUI();
  const { t } = useLanguage();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  if (!user) return <Navigate to="/sign-in" replace state={{ from: loc.pathname }} />;

  const doLogout = async () => {
    if (await ui.ask({ title: t('logout'), message: t('logoutQuestion'), cancelLabel: t('cancel'), confirmLabel: t('logout'), destructive: true })) logout();
  };
  const name = user.name || user.email.split('@')[0] || 'User';
  const link = ({ isActive }) => `px-4 py-2 rounded-full text-sm font-medium transition ${isActive ? 'bg-green-50 text-green-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-green-100 selection:text-green-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Link to="/app" className="flex items-center gap-2.5 shrink-0">
            <span className="w-9 h-9 rounded-xl bg-green-700 text-white flex items-center justify-center"><LayoutDashboard className="w-5 h-5" /></span>
            <span className="text-lg font-bold tracking-tight">Skrepa Chap</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {nav(t).map(([to, label, end]) => <NavLink key={to} to={to} end={end} className={link}>{label}</NavLink>)}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />
            <Link to="/app/create-pickup" className={`${btnCls} !py-2 !px-4 text-sm`}><Plus className="w-4 h-4" />New pickup</Link>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
              <Link to="/app/profile" className="flex items-center gap-2 min-w-0">
                <span className="w-9 h-9 rounded-full bg-green-100 text-green-800 font-bold flex items-center justify-center">{name.charAt(0).toUpperCase()}</span>
                <span className="text-sm font-medium max-w-[9rem] truncate">{name}</span>
              </Link>
              <button aria-label={t('logout')} onClick={doLogout} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
          <button className="md:hidden p-2" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
        </div>
        {open && (
          <div className="md:hidden border-t border-slate-100 bg-white px-5 py-4 flex flex-col gap-1" onClick={() => setOpen(false)}>
            {nav(t).map(([to, label, end]) => <NavLink key={to} to={to} end={end} className={link}>{label}</NavLink>)}
            <NavLink to="/app/create-pickup" className={link}>New pickup</NavLink>
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
              <LanguageToggle />
              <button onClick={doLogout} className="flex items-center gap-2 text-sm font-medium text-red-600"><LogOut className="w-4 h-4" />{t('logout')}</button>
            </div>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-5 py-8"><Outlet /></main>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, back }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        {back && <button onClick={() => navigate(-1)} className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft className="w-4 h-4" />Back</button>}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export const statusStyles = {
  pending: 'bg-amber-100 text-amber-800',
  assigned: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-sky-100 text-sky-800',
  cancelled: 'bg-red-100 text-red-700',
};
export const StatusBadge = ({ status, label }) => (
  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status] || statusStyles.pending}`}>{label ?? status}</span>
);
