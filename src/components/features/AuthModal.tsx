import { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Mode = 'login' | 'register';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: Mode;
}

export default function AuthModal({ open, onClose, defaultMode = 'login' }: AuthModalProps) {
  const { t, isRTL } = useLanguage();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (mode === 'login') {
        login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        if (form.password !== form.confirm) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        register(form.name, form.email, form.password);
        toast.success('Account created!');
      }
      setLoading(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-strong rounded-2xl border border-white/10 shadow-2xl p-6 animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 glass rounded-lg text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        <div className={cn('mb-6', isRTL && 'text-right')}>
          <h2 className="text-xl font-bold text-foreground mb-1">
            {mode === 'login' ? t.auth.welcomeBack : t.auth.createAccount}
          </h2>
          <p className="text-sm text-muted-foreground">TechLand Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div className="relative">
              <UserIcon className={cn('absolute top-3 w-4 h-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
              <input
                type="text"
                placeholder={t.auth.name}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className={cn(
                  'w-full h-11 glass border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-all',
                  isRTL ? 'pr-9 pl-3 text-right font-rtl' : 'pl-9 pr-3'
                )}
              />
            </div>
          )}

          <div className="relative">
            <Mail className={cn('absolute top-3 w-4 h-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
            <input
              type="email"
              placeholder={t.auth.email}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              className={cn(
                'w-full h-11 glass border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-all',
                isRTL ? 'pr-9 pl-3 text-right font-rtl' : 'pl-9 pr-3'
              )}
            />
          </div>

          <div className="relative">
            <Lock className={cn('absolute top-3 w-4 h-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder={t.auth.password}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              className={cn(
                'w-full h-11 glass border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-all',
                isRTL ? 'pr-9 pl-9 text-right' : 'pl-9 pr-9'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              className={cn('absolute top-3 text-muted-foreground hover:text-foreground transition-all', isRTL ? 'left-3' : 'right-3')}
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {mode === 'register' && (
            <div className="relative">
              <Lock className={cn('absolute top-3 w-4 h-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
              <input
                type="password"
                placeholder={t.auth.confirmPassword}
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                required
                className={cn(
                  'w-full h-11 glass border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-all',
                  isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3'
                )}
              />
            </div>
          )}

          {mode === 'login' && (
            <div className={cn('flex', isRTL ? 'justify-start' : 'justify-end')}>
              <button type="button" className="text-xs text-primary hover:text-primary/80 transition-all">
                {t.auth.forgotPassword}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 gradient-brand text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? t.common.loading : mode === 'login' ? t.auth.signIn : t.auth.signUp}
          </button>
        </form>

        <p className={cn('mt-4 text-sm text-center text-muted-foreground', isRTL && 'text-right sm:text-center')}>
          {mode === 'login' ? t.auth.noAccount : t.auth.alreadyHaveAccount}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-primary font-medium hover:text-primary/80 transition-all"
          >
            {mode === 'login' ? t.auth.signUp : t.auth.signIn}
          </button>
        </p>
      </div>
    </div>
  );
}
