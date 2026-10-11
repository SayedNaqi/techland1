import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { t, language, isRTL } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to TechLand!');
      navigate(`/${language}`);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background circuit-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className={cn('text-center mb-8', isRTL && 'text-right sm:text-center')}>
          <Link to={`/${language}`} className="inline-flex items-center gap-3 mb-6">
            <img
              src="https://cdn-ai.onspace.ai/onspace/project/uploads/eMhXg6ZT6MzmrBPaj8Bbtk/IMG_5000.png"
              alt="TechLand"
              className="h-12 w-12 rounded-full object-cover"
            />
            <span className="text-2xl font-black text-white">
              Tech<span className="gradient-text">Land</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t.auth.createAccount}</h1>
          <p className="text-sm text-muted-foreground">{language === 'fa' ? 'به خانواده تک‌لند بپیوندید' : 'Join the TechLand community'}</p>
        </div>

        <div className="glass-strong rounded-2xl border border-white/10 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <UserIcon className={cn('absolute top-3.5 w-4 h-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
              <input
                type="text"
                placeholder={t.auth.name}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className={cn(
                  'w-full h-12 glass border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-all',
                  isRTL ? 'pr-9 pl-3 text-right font-rtl' : 'pl-9 pr-3'
                )}
              />
            </div>

            <div className="relative">
              <Mail className={cn('absolute top-3.5 w-4 h-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
              <input
                type="email"
                placeholder={t.auth.email}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className={cn(
                  'w-full h-12 glass border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-all',
                  isRTL ? 'pr-9 pl-3 text-right font-rtl' : 'pl-9 pr-3'
                )}
              />
            </div>

            <div className="relative">
              <Lock className={cn('absolute top-3.5 w-4 h-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder={t.auth.password}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                className={cn(
                  'w-full h-12 glass border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-all',
                  isRTL ? 'pr-9 pl-9 text-right' : 'pl-9 pr-9'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className={cn('absolute top-3.5 text-muted-foreground hover:text-foreground transition-all', isRTL ? 'left-3' : 'right-3')}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Lock className={cn('absolute top-3.5 w-4 h-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
              <input
                type="password"
                placeholder={t.auth.confirmPassword}
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                required
                className={cn(
                  'w-full h-12 glass border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-all',
                  isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3'
                )}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 gradient-brand text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-all disabled:opacity-50 glow-cyan"
            >
              {loading ? t.common.loading : t.auth.signUp}
            </button>
          </form>

          <p className="mt-5 text-sm text-center text-muted-foreground">
            {t.auth.alreadyHaveAccount}{' '}
            <Link to={`/${language}/login`} className="text-primary font-medium hover:text-primary/80 transition-all">
              {t.auth.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
