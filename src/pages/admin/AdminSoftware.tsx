import { useState } from 'react';
import { Plus, AppWindow, Star, Download } from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import FormModal, { FormField, FormInput, FormSelect, FormTextarea } from '@/components/admin/FormModal';
import { SOFTWARE_LIST } from '@/constants/mockData';
import type { Software } from '@/types';
import { cn, formatPrice, formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

const EMPTY: Partial<Software> = {
  name: '', nameFa: '', version: '', category: '', platform: [],
  thumbnail: '', screenshots: [], description: '', descriptionFa: '',
  accessType: 'free', downloads: 0, rating: 0, size: '', developer: '',
};

export default function AdminSoftware() {
  const [software, setSoftware] = useState<Software[]>(SOFTWARE_LIST);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Software>>(EMPTY);
  const [isEdit, setIsEdit] = useState(false);

  const columns: Column<Software>[] = [
    {
      key: 'thumbnail', label: 'Icon', width: 'w-14',
      render: row => <img src={row.thumbnail} alt={row.name} className="w-10 h-10 rounded-xl object-cover" />,
    },
    {
      key: 'name', label: 'Name', sortable: true,
      render: row => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.developer} · v{row.version}</p>
        </div>
      )
    },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'platform', label: 'Platforms',
      render: row => (
        <div className="flex gap-1 flex-wrap max-w-[120px]">
          {row.platform.slice(0, 2).map(p => (
            <span key={p} className="px-1.5 py-0.5 text-[10px] glass rounded border border-white/10 text-muted-foreground">{p}</span>
          ))}
          {row.platform.length > 2 && <span className="text-[10px] text-muted-foreground">+{row.platform.length - 2}</span>}
        </div>
      )
    },
    {
      key: 'downloads', label: 'Downloads', sortable: true,
      render: row => (
        <span className="flex items-center gap-1 text-muted-foreground text-sm">
          <Download className="w-3 h-3" />{formatNumber(row.downloads)}
        </span>
      )
    },
    {
      key: 'accessType', label: 'Access',
      render: row => (
        <div className="flex flex-col gap-1">
          <span className={cn('px-2 py-0.5 text-[10px] font-bold rounded-lg uppercase w-fit',
            row.accessType === 'free' ? 'bg-green-500/20 text-green-400' :
            row.accessType === 'vip' ? 'bg-purple-500/20 text-purple-400' :
            'bg-primary/20 text-primary'
          )}>
            {row.accessType}
          </span>
          {row.price && <span className="text-xs font-semibold text-primary">{formatPrice(row.price, row.currency)}</span>}
        </div>
      )
    },
    {
      key: 'rating', label: 'Rating', sortable: true,
      render: row => (
        <span className="flex items-center gap-1 text-yellow-400 font-semibold">
          <Star className="w-3 h-3 fill-yellow-400" />{row.rating}
        </span>
      )
    },
  ];

  const handleAdd = () => {
    setEditing({ ...EMPTY, id: `sw${Date.now()}` });
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (row: Software) => {
    setEditing({ ...row });
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (row: Software) => {
    setSoftware(prev => prev.filter(s => s.id !== row.id));
    toast.success(`"${row.name}" deleted successfully`);
  };

  const handleSave = () => {
    if (!editing.name?.trim()) { toast.error('Name is required'); return; }
    if (isEdit) {
      setSoftware(prev => prev.map(s => s.id === editing.id ? { ...s, ...editing } as Software : s));
      toast.success('Software updated successfully');
    } else {
      setSoftware(prev => [editing as Software, ...prev]);
      toast.success('Software added successfully');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <AppWindow className="w-5 h-5 text-primary" /> Software Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{software.length} total software</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> Add Software
        </button>
      </div>

      <div className="glass border border-white/5 rounded-2xl p-5">
        <DataTable
          data={software}
          columns={columns}
          searchKeys={['name', 'nameFa', 'developer', 'category'] as (keyof Software)[]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEdit ? 'Edit Software' : 'Add New Software'}
        onSubmit={handleSave}
        submitLabel={isEdit ? 'Update Software' : 'Add Software'}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Name (English)" required>
            <FormInput value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} />
          </FormField>
          <FormField label="Name (Persian)">
            <FormInput value={editing.nameFa || ''} onChange={e => setEditing(p => ({ ...p, nameFa: e.target.value }))} className="font-rtl text-right" />
          </FormField>
          <FormField label="Developer" required>
            <FormInput value={editing.developer || ''} onChange={e => setEditing(p => ({ ...p, developer: e.target.value }))} />
          </FormField>
          <FormField label="Version">
            <FormInput value={editing.version || ''} onChange={e => setEditing(p => ({ ...p, version: e.target.value }))} placeholder="1.0.0" />
          </FormField>
          <FormField label="Category">
            <FormInput value={editing.category || ''} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))} placeholder="Design, Utilities..." />
          </FormField>
          <FormField label="Size">
            <FormInput value={editing.size || ''} onChange={e => setEditing(p => ({ ...p, size: e.target.value }))} placeholder="100 MB" />
          </FormField>
          <FormField label="Access Type" required>
            <FormSelect value={editing.accessType || 'free'} onChange={e => setEditing(p => ({ ...p, accessType: e.target.value as Software['accessType'] }))}>
              <option value="free" className="bg-card">Free</option>
              <option value="paid" className="bg-card">Paid</option>
              <option value="vip" className="bg-card">VIP</option>
            </FormSelect>
          </FormField>
          <FormField label="Price (USD)">
            <FormInput type="number" min="0" step="0.01" value={editing.price || ''} onChange={e => setEditing(p => ({ ...p, price: parseFloat(e.target.value) }))} />
          </FormField>
          <FormField label="Platforms" hint="Comma separated">
            <FormInput value={editing.platform?.join(', ') || ''} onChange={e => setEditing(p => ({ ...p, platform: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))} placeholder="Windows, macOS" />
          </FormField>
          <FormField label="Thumbnail URL">
            <FormInput value={editing.thumbnail || ''} onChange={e => setEditing(p => ({ ...p, thumbnail: e.target.value }))} placeholder="https://..." />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Description">
              <FormTextarea rows={3} value={editing.description || ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} />
            </FormField>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
