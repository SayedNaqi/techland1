import { useState } from 'react';
import { Plus, CreditCard, Check, Star } from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import FormModal, { FormField, FormInput, FormSelect } from '@/components/admin/FormModal';
import { SUBSCRIPTION_PLANS } from '@/constants/mockData';
import type { SubscriptionPlan } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

const PERIOD_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: '3 Months',
  yearly: 'Yearly',
  lifetime: 'Lifetime',
};

const EMPTY: Partial<SubscriptionPlan> = {
  name: '', nameFa: '', period: 'monthly', price: 0, currency: 'USD',
  features: [], featuresFa: [],
};

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(SUBSCRIPTION_PLANS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<SubscriptionPlan>>(EMPTY);
  const [isEdit, setIsEdit] = useState(false);

  const columns: Column<SubscriptionPlan>[] = [
    {
      key: 'name', label: 'Plan', sortable: true,
      render: row => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
            <CreditCard className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="font-medium text-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground font-rtl">{row.nameFa}</p>
          </div>
        </div>
      )
    },
    {
      key: 'period', label: 'Period',
      render: row => <span className="text-sm text-muted-foreground">{PERIOD_LABELS[row.period]}</span>
    },
    {
      key: 'price', label: 'Price', sortable: true,
      render: row => (
        <div>
          <span className="font-bold text-primary text-base">{formatPrice(row.price, row.currency)}</span>
          {row.originalPrice && (
            <span className="text-xs text-muted-foreground line-through ml-1">{formatPrice(row.originalPrice, row.currency)}</span>
          )}
        </div>
      )
    },
    {
      key: 'features', label: 'Features',
      render: row => <span className="text-sm text-muted-foreground">{row.features.length} features</span>
    },
    {
      key: 'isPopular', label: 'Badges',
      render: row => (
        <div className="flex gap-1.5">
          {row.isPopular && (
            <span className="flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold bg-primary/20 text-primary rounded-lg">
              <Star className="w-2.5 h-2.5 fill-primary" /> Popular
            </span>
          )}
          {row.isBestValue && (
            <span className="flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold bg-yellow-500/20 text-yellow-400 rounded-lg">
              Best Value
            </span>
          )}
        </div>
      )
    },
  ];

  const handleAdd = () => {
    setEditing({ ...EMPTY, id: `plan-${Date.now()}` });
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (row: SubscriptionPlan) => {
    setEditing({ ...row });
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (row: SubscriptionPlan) => {
    setPlans(prev => prev.filter(p => p.id !== row.id));
    toast.success(`"${row.name}" plan deleted`);
  };

  const handleSave = () => {
    if (!editing.name?.trim()) { toast.error('Plan name is required'); return; }
    if (isEdit) {
      setPlans(prev => prev.map(p => p.id === editing.id ? { ...p, ...editing } as SubscriptionPlan : p));
      toast.success('Plan updated successfully');
    } else {
      setPlans(prev => [...prev, editing as SubscriptionPlan]);
      toast.success('Plan added successfully');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Subscription Plans
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{plans.length} active plans</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      {/* Plan Cards Preview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {plans.map(plan => (
          <div key={plan.id} className={cn('glass border rounded-2xl p-4 relative', plan.isPopular ? 'border-primary/30' : 'border-white/5')}>
            {plan.isPopular && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold gradient-brand text-white rounded-full whitespace-nowrap">
                POPULAR
              </span>
            )}
            <p className="font-bold text-foreground text-sm">{plan.name}</p>
            <p className="text-xl font-black text-primary mt-1">{formatPrice(plan.price, plan.currency)}</p>
            <p className="text-[10px] text-muted-foreground">{PERIOD_LABELS[plan.period]}</p>
            <div className="mt-3 space-y-1">
              {plan.features.slice(0, 3).map((f, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-primary shrink-0" />
                  <span className="text-[10px] text-muted-foreground">{f}</span>
                </div>
              ))}
              {plan.features.length > 3 && <p className="text-[10px] text-muted-foreground pl-4.5">+{plan.features.length - 3} more</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="glass border border-white/5 rounded-2xl p-5">
        <DataTable
          data={plans}
          columns={columns}
          searchKeys={['name', 'nameFa'] as (keyof SubscriptionPlan)[]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEdit ? 'Edit Plan' : 'Add New Plan'}
        onSubmit={handleSave}
        submitLabel={isEdit ? 'Update Plan' : 'Add Plan'}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Plan Name (EN)" required>
              <FormInput value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} placeholder="Monthly" />
            </FormField>
            <FormField label="Plan Name (FA)">
              <FormInput value={editing.nameFa || ''} onChange={e => setEditing(p => ({ ...p, nameFa: e.target.value }))} placeholder="ماهانه" className="font-rtl text-right" />
            </FormField>
            <FormField label="Period" required>
              <FormSelect value={editing.period || 'monthly'} onChange={e => setEditing(p => ({ ...p, period: e.target.value as SubscriptionPlan['period'] }))}>
                <option value="monthly" className="bg-card">Monthly</option>
                <option value="quarterly" className="bg-card">Quarterly (3 months)</option>
                <option value="yearly" className="bg-card">Yearly</option>
                <option value="lifetime" className="bg-card">Lifetime</option>
              </FormSelect>
            </FormField>
            <FormField label="Price (USD)" required>
              <FormInput type="number" min="0" step="0.01" value={editing.price || ''} onChange={e => setEditing(p => ({ ...p, price: parseFloat(e.target.value) }))} />
            </FormField>
            <FormField label="Original Price (optional)">
              <FormInput type="number" min="0" step="0.01" value={editing.originalPrice || ''} onChange={e => setEditing(p => ({ ...p, originalPrice: parseFloat(e.target.value) }))} />
            </FormField>
          </div>
          <FormField label="Features (EN)" hint="One feature per line">
            <textarea
              rows={5}
              value={editing.features?.join('\n') || ''}
              onChange={e => setEditing(p => ({ ...p, features: e.target.value.split('\n').filter(Boolean) }))}
              placeholder={"Unlimited Streaming\nHD & 4K Quality\nMovie Downloads"}
              className="w-full px-3 py-2 bg-background border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors resize-none"
            />
          </FormField>
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!editing.isPopular} onChange={e => setEditing(p => ({ ...p, isPopular: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <span className="text-sm text-foreground/80">Most Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!editing.isBestValue} onChange={e => setEditing(p => ({ ...p, isBestValue: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <span className="text-sm text-foreground/80">Best Value</span>
            </label>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
