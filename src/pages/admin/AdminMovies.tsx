import { useState } from 'react';
import { Plus, Film, Star } from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import FormModal, { FormField, FormInput, FormSelect, FormTextarea } from '@/components/admin/FormModal';
import { MOVIES } from '@/constants/mockData';
import type { Movie } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const EMPTY: Partial<Movie> = {
  title: '', titleFa: '', year: new Date().getFullYear(), genre: [], rating: 0,
  poster: '', backdrop: '', duration: '', country: '', description: '', descriptionFa: '',
  accessType: 'subscription',
};

export default function AdminMovies() {
  const [movies, setMovies] = useState<Movie[]>(MOVIES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Movie>>(EMPTY);
  const [isEdit, setIsEdit] = useState(false);

  const columns: Column<Movie>[] = [
    {
      key: 'poster', label: 'Poster', width: 'w-16',
      render: row => (
        <img src={row.poster} alt={row.title} className="w-9 h-12 rounded-lg object-cover" />
      ),
    },
    { key: 'title', label: 'Title', sortable: true,
      render: row => (
        <div>
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="text-xs text-muted-foreground font-rtl">{row.titleFa}</p>
        </div>
      )
    },
    { key: 'year', label: 'Year', sortable: true },
    { key: 'genre', label: 'Genre',
      render: row => (
        <div className="flex gap-1 flex-wrap max-w-[160px]">
          {row.genre.slice(0, 2).map(g => (
            <span key={g} className="px-1.5 py-0.5 text-[10px] glass rounded border border-white/10 text-muted-foreground">{g}</span>
          ))}
        </div>
      )
    },
    { key: 'rating', label: 'Rating', sortable: true,
      render: row => (
        <span className="flex items-center gap-1 text-yellow-400 font-semibold">
          <Star className="w-3 h-3 fill-yellow-400" />{row.rating}
        </span>
      )
    },
    { key: 'accessType', label: 'Access',
      render: row => (
        <span className={cn('px-2 py-0.5 text-[10px] font-bold rounded-lg uppercase',
          row.accessType === 'free' ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'
        )}>
          {row.accessType}
        </span>
      )
    },
    { key: 'country', label: 'Country', sortable: true },
  ];

  const handleAdd = () => {
    setEditing({ ...EMPTY, id: `m${Date.now()}` });
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (row: Movie) => {
    setEditing({ ...row });
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (row: Movie) => {
    setMovies(prev => prev.filter(m => m.id !== row.id));
    toast.success(`"${row.title}" deleted successfully`);
  };

  const handleSave = () => {
    if (!editing.title?.trim()) { toast.error('Title is required'); return; }
    if (isEdit) {
      setMovies(prev => prev.map(m => m.id === editing.id ? { ...m, ...editing } as Movie : m));
      toast.success('Movie updated successfully');
    } else {
      setMovies(prev => [editing as Movie, ...prev]);
      toast.success('Movie added successfully');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" /> Movie Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{movies.length} total movies</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Movie
        </button>
      </div>

      <div className="glass border border-white/5 rounded-2xl p-5">
        <DataTable
          data={movies}
          columns={columns}
          searchKeys={['title', 'titleFa', 'country', 'year'] as (keyof Movie)[]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Form Modal */}
      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEdit ? 'Edit Movie' : 'Add New Movie'}
        subtitle="Fill in the movie details below"
        onSubmit={handleSave}
        submitLabel={isEdit ? 'Update Movie' : 'Add Movie'}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Title (English)" required>
            <FormInput value={editing.title || ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} placeholder="Movie title..." />
          </FormField>
          <FormField label="Title (Persian)" required>
            <FormInput value={editing.titleFa || ''} onChange={e => setEditing(p => ({ ...p, titleFa: e.target.value }))} placeholder="عنوان فیلم..." className="font-rtl text-right" />
          </FormField>
          <FormField label="Year" required>
            <FormInput type="number" value={editing.year || ''} onChange={e => setEditing(p => ({ ...p, year: parseInt(e.target.value) }))} placeholder="2024" />
          </FormField>
          <FormField label="Duration (minutes)" required>
            <FormInput type="number" value={editing.duration || ''} onChange={e => setEditing(p => ({ ...p, duration: e.target.value }))} placeholder="120" />
          </FormField>
          <FormField label="Rating (0–10)">
            <FormInput type="number" min="0" max="10" step="0.1" value={editing.rating || ''} onChange={e => setEditing(p => ({ ...p, rating: parseFloat(e.target.value) }))} placeholder="8.5" />
          </FormField>
          <FormField label="Country">
            <FormInput value={editing.country || ''} onChange={e => setEditing(p => ({ ...p, country: e.target.value }))} placeholder="USA" />
          </FormField>
          <FormField label="Access Type" required>
            <FormSelect value={editing.accessType || 'subscription'} onChange={e => setEditing(p => ({ ...p, accessType: e.target.value as Movie['accessType'] }))}>
              <option value="subscription" className="bg-card">Subscription</option>
              <option value="free" className="bg-card">Free</option>
            </FormSelect>
          </FormField>
          <FormField label="Genres" hint="Comma separated: Action, Drama">
            <FormInput
              value={editing.genre?.join(', ') || ''}
              onChange={e => setEditing(p => ({ ...p, genre: e.target.value.split(',').map(g => g.trim()).filter(Boolean) }))}
              placeholder="Action, Drama, Thriller"
            />
          </FormField>
          <FormField label="Poster URL">
            <FormInput value={editing.poster || ''} onChange={e => setEditing(p => ({ ...p, poster: e.target.value }))} placeholder="https://..." />
          </FormField>
          <FormField label="Backdrop URL">
            <FormInput value={editing.backdrop || ''} onChange={e => setEditing(p => ({ ...p, backdrop: e.target.value }))} placeholder="https://..." />
          </FormField>
          <FormField label="Embed URL (bunny.net)" hint="Paste Bunny embed, play link, or full <iframe> snippet — e.g. https://player.mediadelivery.net/embed/777612/…">
            <FormInput value={editing.embedUrl || ''} onChange={e => setEditing(p => ({ ...p, embedUrl: e.target.value }))} placeholder="https://player.mediadelivery.net/embed/777612/…" />
          </FormField>
          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!editing.isFeatured} onChange={e => setEditing(p => ({ ...p, isFeatured: e.target.checked }))} className="w-4 h-4 accent-primary rounded" />
              <span className="text-sm text-foreground/80">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!editing.isNew} onChange={e => setEditing(p => ({ ...p, isNew: e.target.checked }))} className="w-4 h-4 accent-primary rounded" />
              <span className="text-sm text-foreground/80">New</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!editing.isTrending} onChange={e => setEditing(p => ({ ...p, isTrending: e.target.checked }))} className="w-4 h-4 accent-primary rounded" />
              <span className="text-sm text-foreground/80">Trending</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Description (English)">
              <FormTextarea rows={3} value={editing.description || ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} placeholder="Movie description..." />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Description (Persian)">
              <FormTextarea rows={3} value={editing.descriptionFa || ''} onChange={e => setEditing(p => ({ ...p, descriptionFa: e.target.value }))} placeholder="توضیحات فیلم..." className="font-rtl text-right" />
            </FormField>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
