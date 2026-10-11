import { useState } from 'react';
import { Plus, Tv, Star } from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import FormModal, { FormField, FormInput, FormSelect, FormTextarea } from '@/components/admin/FormModal';
import { SERIES } from '@/constants/mockData';
import type { Series } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const EMPTY: Partial<Series> = {
  title: '', titleFa: '', year: new Date().getFullYear(), genre: [], rating: 0,
  poster: '', backdrop: '', seasons: 1, episodes: 0, country: '',
  description: '', descriptionFa: '', accessType: 'subscription',
};

export default function AdminSeries() {
  const [series, setSeries] = useState<Series[]>(SERIES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Series>>(EMPTY);
  const [isEdit, setIsEdit] = useState(false);

  const columns: Column<Series>[] = [
    {
      key: 'poster', label: 'Poster', width: 'w-16',
      render: row => <img src={row.poster} alt={row.title} className="w-9 h-12 rounded-lg object-cover" />,
    },
    {
      key: 'title', label: 'Title', sortable: true,
      render: row => (
        <div>
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="text-xs text-muted-foreground font-rtl">{row.titleFa}</p>
        </div>
      )
    },
    { key: 'year', label: 'Year', sortable: true },
    {
      key: 'seasons', label: 'Seasons/Eps',
      render: row => <span className="text-sm text-muted-foreground">{row.seasons}S / {row.episodes}E</span>,
    },
    {
      key: 'rating', label: 'Rating', sortable: true,
      render: row => (
        <span className="flex items-center gap-1 text-yellow-400 font-semibold">
          <Star className="w-3 h-3 fill-yellow-400" />{row.rating}
        </span>
      )
    },
    {
      key: 'accessType', label: 'Access',
      render: row => (
        <span className={cn('px-2 py-0.5 text-[10px] font-bold rounded-lg uppercase',
          row.accessType === 'free' ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'
        )}>
          {row.accessType}
        </span>
      )
    },
  ];

  const handleAdd = () => {
    setEditing({ ...EMPTY, id: `s${Date.now()}` });
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (row: Series) => {
    setEditing({ ...row });
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (row: Series) => {
    setSeries(prev => prev.filter(s => s.id !== row.id));
    toast.success(`"${row.title}" deleted successfully`);
  };

  const handleSave = () => {
    if (!editing.title?.trim()) { toast.error('Title is required'); return; }
    if (isEdit) {
      setSeries(prev => prev.map(s => s.id === editing.id ? { ...s, ...editing } as Series : s));
      toast.success('Series updated successfully');
    } else {
      setSeries(prev => [editing as Series, ...prev]);
      toast.success('Series added successfully');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Tv className="w-5 h-5 text-primary" /> Series Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{series.length} total series</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> Add Series
        </button>
      </div>

      <div className="glass border border-white/5 rounded-2xl p-5">
        <DataTable
          data={series}
          columns={columns}
          searchKeys={['title', 'titleFa', 'country'] as (keyof Series)[]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEdit ? 'Edit Series' : 'Add New Series'}
        onSubmit={handleSave}
        submitLabel={isEdit ? 'Update Series' : 'Add Series'}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Title (English)" required>
            <FormInput value={editing.title || ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} placeholder="Series title..." />
          </FormField>
          <FormField label="Title (Persian)" required>
            <FormInput value={editing.titleFa || ''} onChange={e => setEditing(p => ({ ...p, titleFa: e.target.value }))} placeholder="عنوان سریال..." className="font-rtl text-right" />
          </FormField>
          <FormField label="Year" required>
            <FormInput type="number" value={editing.year || ''} onChange={e => setEditing(p => ({ ...p, year: parseInt(e.target.value) }))} />
          </FormField>
          <FormField label="Country">
            <FormInput value={editing.country || ''} onChange={e => setEditing(p => ({ ...p, country: e.target.value }))} placeholder="USA" />
          </FormField>
          <FormField label="Seasons">
            <FormInput type="number" min="1" value={editing.seasons || 1} onChange={e => setEditing(p => ({ ...p, seasons: parseInt(e.target.value) }))} />
          </FormField>
          <FormField label="Episodes">
            <FormInput type="number" min="0" value={editing.episodes || 0} onChange={e => setEditing(p => ({ ...p, episodes: parseInt(e.target.value) }))} />
          </FormField>
          <FormField label="Rating (0–10)">
            <FormInput type="number" min="0" max="10" step="0.1" value={editing.rating || ''} onChange={e => setEditing(p => ({ ...p, rating: parseFloat(e.target.value) }))} />
          </FormField>
          <FormField label="Access Type" required>
            <FormSelect value={editing.accessType || 'subscription'} onChange={e => setEditing(p => ({ ...p, accessType: e.target.value as Series['accessType'] }))}>
              <option value="subscription" className="bg-card">Subscription</option>
              <option value="free" className="bg-card">Free</option>
            </FormSelect>
          </FormField>
          <FormField label="Genres" hint="Comma separated">
            <FormInput value={editing.genre?.join(', ') || ''} onChange={e => setEditing(p => ({ ...p, genre: e.target.value.split(',').map(g => g.trim()).filter(Boolean) }))} placeholder="Drama, Thriller" />
          </FormField>
          <FormField label="Poster URL">
            <FormInput value={editing.poster || ''} onChange={e => setEditing(p => ({ ...p, poster: e.target.value }))} placeholder="https://..." />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Description (English)">
              <FormTextarea rows={3} value={editing.description || ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Description (Persian)">
              <FormTextarea rows={3} value={editing.descriptionFa || ''} onChange={e => setEditing(p => ({ ...p, descriptionFa: e.target.value }))} className="font-rtl text-right" />
            </FormField>
          </div>
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!editing.isFeatured} onChange={e => setEditing(p => ({ ...p, isFeatured: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <span className="text-sm text-foreground/80">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!editing.isNew} onChange={e => setEditing(p => ({ ...p, isNew: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <span className="text-sm text-foreground/80">New</span>
            </label>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
