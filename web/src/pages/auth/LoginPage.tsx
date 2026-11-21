import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Lock, Phone, KeyRound, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  
  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const redirectByRole = (role: string) => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'TEACHER') navigate('/teacher');
    else navigate('/student');
  };

  // Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { phone, password });
      if (res.data.success) {
        login(res.data.accessToken, res.data.user);
        redirectByRole(res.data.user.role);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/send', { phone });
      if (res.data.success) {
        setOtpSent(true);
        if (res.data.devOtp) {
          setDevOtpHint(res.data.devOtp);
        }
        // Start 60s cooldown
        setCooldown(60);
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось отправить код');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/otp/verify', { phone, code: otpCode });
      if (res.data.success) {
        if (res.data.isRegistered && res.data.accessToken) {
          login(res.data.accessToken, res.data.user);
          redirectByRole(res.data.user.role);
        } else {
          // Redirect to register with phone prefilled
          navigate(`/register?phone=${encodeURIComponent(phone)}`);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Неверный код');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-purple-500/20 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-black text-2xl shadow-lg shadow-purple-600/30 mb-3">
            P
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Вход в ProTest
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Платформа математического тестирования
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setLoginMode('password'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              loginMode === 'password'
                ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            По паролю
          </button>
          <button
            type="button"
            onClick={() => { setLoginMode('otp'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              loginMode === 'otp'
                ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            По SMS коду (+998)
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dev OTP Helper */}
        {devOtpHint && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Тестовый OTP код: <strong className="font-mono text-base">{devOtpHint}</strong></span>
          </div>
        )}

        {loginMode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Номер телефона
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998901234567"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? 'Вход...' : 'Войти в аккаунт'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Номер телефона
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998901234567"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || cooldown > 0}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 shrink-0 transition-colors disabled:opacity-50"
                >
                  {cooldown > 0 ? `${cooldown}s` : otpSent ? 'Повторить' : 'Выслать код'}
                </button>
              </div>
            </div>

            {otpSent && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  6-значный SMS-код
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm font-mono tracking-widest text-center"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !otpSent || otpCode.length !== 6}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? 'Проверка...' : 'Подтвердить и войти'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Demo Credentials Box */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Быстрый вход для тестирования (пароль: <code className="text-purple-600">ProTest2026!</code>):
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => { setPhone('+998901234567'); setPassword('ProTest2026!'); }}
              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-medium text-center"
            >
              Администратор
            </button>
            <button
              type="button"
              onClick={() => { setPhone('+998902345678'); setPassword('ProTest2026!'); }}
              className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-medium text-center"
            >
              Преподаватель
            </button>
            <button
              type="button"
              onClick={() => { setPhone('+998903456789'); setPassword('ProTest2026!'); }}
              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium text-center"
            >
              Ученик
            </button>
          </div>
        </div>

        {/* Register Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Еще нет аккаунта?{' '}
          <Link to="/register" className="font-semibold text-purple-600 hover:text-purple-700 underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
};
