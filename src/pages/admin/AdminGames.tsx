import { useState } from 'react';
import { Plus, Gamepad2, Star } from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import FormModal, { FormField, FormInput, FormSelect, FormTextarea } from '@/components/admin/FormModal';
import { GAMES } from '@/constants/mockData';
import type { Game } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

const EMPTY: Partial<Game> = {
  title: '', titleFa: '', genre: [], platform: [], thumbnail: '',
  screenshots: [], description: '', descriptionFa: '',
  accessType: 'paid', price: 0, currency: 'USD',
  rating: 0, releaseYear: new Date().getFullYear(),
  developer: '', publisher: '', size: '',
};

export default function AdminGames() {
  const [games, setGames] = useState<Game[]>(GAMES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Game>>(EMPTY);
  const [isEdit, setIsEdit] = useState(false);

  const columns: Column<Game>[] = [
    {
      key: 'thumbnail', label: 'Cover', width: 'w-16',
      render: row => <img src={row.thumbnail} alt={row.title} className="w-14 h-10 rounded-lg object-cover" />,
    },
    {
      key: 'title', label: 'Title', sortable: true,
      render: row => (
        <div>
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="text-xs text-muted-foreground">{row.developer}</p>
        </div>
      )
    },
    { key: 'releaseYear', label: 'Year', sortable: true },
    {
      key: 'platform', label: 'Platforms',
      render: row => (
        <div className="flex gap-1 flex-wrap max-w-[140px]">
          {row.platform.slice(0, 3).map(p => (
            <span key={p} className="px-1.5 py-0.5 text-[10px] glass rounded border border-white/10 text-muted-foreground">{p}</span>
          ))}
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
  ];

  const handleAdd = () => {
    setEditing({ ...EMPTY, id: `g${Date.now()}` });
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (row: Game) => {
    setEditing({ ...row });
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (row: Game) => {
    setGames(prev => prev.filter(g => g.id !== row.id));
    toast.success(`"${row.title}" deleted successfully`);
  };

  const handleSave = () => {
    if (!editing.title?.trim()) { toast.error('Title is required'); return; }
    if (isEdit) {
      setGames(prev => prev.map(g => g.id === editing.id ? { ...g, ...editing } as Game : g));
      toast.success('Game updated successfully');
    } else {
      setGames(prev => [editing as Game, ...prev]);
      toast.success('Game added successfully');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-primary" /> Game Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{games.length} total games</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> Add Game
        </button>
      </div>

      <div className="glass border border-white/5 rounded-2xl p-5">
        <DataTable
          data={games}
          columns={columns}
          searchKeys={['title', 'titleFa', 'developer', 'publisher'] as (keyof Game)[]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEdit ? 'Edit Game' : 'Add New Game'}
        onSubmit={handleSave}
        submitLabel={isEdit ? 'Update Game' : 'Add Game'}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Title (English)" required>
            <FormInput value={editing.title || ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} />
          </FormField>
          <FormField label="Title (Persian)">
            <FormInput value={editing.titleFa || ''} onChange={e => setEditing(p => ({ ...p, titleFa: e.target.value }))} className="font-rtl text-right" />
          </FormField>
          <FormField label="Developer" required>
            <FormInput value={editing.developer || ''} onChange={e => setEditing(p => ({ ...p, developer: e.target.value }))} />
          </FormField>
          <FormField label="Publisher">
            <FormInput value={editing.publisher || ''} onChange={e => setEditing(p => ({ ...p, publisher: e.target.value }))} />
          </FormField>
          <FormField label="Release Year">
            <FormInput type="number" value={editing.releaseYear || ''} onChange={e => setEditing(p => ({ ...p, releaseYear: parseInt(e.target.value) }))} />
          </FormField>
          <FormField label="Rating (0–10)">
            <FormInput type="number" min="0" max="10" step="0.1" value={editing.rating || ''} onChange={e => setEditing(p => ({ ...p, rating: parseFloat(e.target.value) }))} />
          </FormField>
          <FormField label="Access Type" required>
            <FormSelect value={editing.accessType || 'paid'} onChange={e => setEditing(p => ({ ...p, accessType: e.target.value as Game['accessType'] }))}>
              <option value="free" className="bg-card">Free</option>
              <option value="paid" className="bg-card">Paid</option>
              <option value="vip" className="bg-card">VIP</option>
            </FormSelect>
          </FormField>
          <FormField label="Price (USD)">
            <FormInput type="number" min="0" step="0.01" value={editing.price || ''} onChange={e => setEditing(p => ({ ...p, price: parseFloat(e.target.value) }))} placeholder="0.00" />
          </FormField>
          <FormField label="Platforms" hint="Comma separated: PC, PlayStation">
            <FormInput value={editing.platform?.join(', ') || ''} onChange={e => setEditing(p => ({ ...p, platform: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))} />
          </FormField>
          <FormField label="Genres" hint="Comma separated">
            <FormInput value={editing.genre?.join(', ') || ''} onChange={e => setEditing(p => ({ ...p, genre: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))} />
          </FormField>
          <FormField label="Size">
            <FormInput value={editing.size || ''} onChange={e => setEditing(p => ({ ...p, size: e.target.value }))} placeholder="70 GB" />
          </FormField>
          <FormField label="Thumbnail URL">
            <FormInput value={editing.thumbnail || ''} onChange={e => setEditing(p => ({ ...p, thumbnail: e.target.value }))} placeholder="https://..." />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Description (English)">
              <FormTextarea rows={3} value={editing.description || ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} />
            </FormField>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
