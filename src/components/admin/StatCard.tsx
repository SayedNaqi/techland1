import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  gradient?: string;
}

export default function StatCard({ label, value, change, changeType = 'up', icon: Icon, gradient }: StatCardProps) {
  return (
    <div className="glass border border-white/5 rounded-2xl p-5 card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
          <p className="text-2xl font-black text-foreground">{value}</p>
          {change && (
            <p className={cn(
              'text-xs font-medium mt-1.5',
              changeType === 'up' ? 'text-green-400' : changeType === 'down' ? 'text-red-400' : 'text-muted-foreground'
            )}>
              {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '→'} {change}
            </p>
          )}
        </div>
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
          gradient || 'gradient-brand'
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
