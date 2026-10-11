import { useState } from 'react';
import { Plus, ShoppingBag, Star, Package } from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import FormModal, { FormField, FormInput, FormTextarea } from '@/components/admin/FormModal';
import { PRODUCTS } from '@/constants/mockData';
import type { Product } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

const EMPTY: Partial<Product> = {
  name: '', nameFa: '', category: '', price: 0, currency: 'USD',
  thumbnail: '', images: [], description: '', descriptionFa: '',
  stock: 0, rating: 0, reviewCount: 0, brand: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Product>>(EMPTY);
  const [isEdit, setIsEdit] = useState(false);

  const columns: Column<Product>[] = [
    {
      key: 'thumbnail', label: 'Image', width: 'w-14',
      render: row => <img src={row.thumbnail} alt={row.name} className="w-10 h-10 rounded-xl object-cover" />,
    },
    {
      key: 'name', label: 'Product', sortable: true,
      render: row => (
        <div>
          <p className="font-medium text-foreground max-w-[200px] truncate">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.brand}</p>
        </div>
      )
    },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'price', label: 'Price', sortable: true,
      render: row => (
        <div>
          <span className="font-semibold text-primary">{formatPrice(row.price, row.currency)}</span>
          {row.originalPrice && (
            <span className="text-xs text-muted-foreground line-through ml-1">{formatPrice(row.originalPrice, row.currency)}</span>
          )}
        </div>
      )
    },
    {
      key: 'stock', label: 'Stock', sortable: true,
      render: row => (
        <span className={cn('flex items-center gap-1 text-sm font-medium',
          row.stock > 20 ? 'text-green-400' : row.stock > 5 ? 'text-yellow-400' : 'text-red-400'
        )}>
          <Package className="w-3 h-3" />{row.stock}
        </span>
      )
    },
    {
      key: 'rating', label: 'Rating', sortable: true,
      render: row => (
        <span className="flex items-center gap-1 text-yellow-400 font-semibold">
          <Star className="w-3 h-3 fill-yellow-400" />{row.rating} <span className="text-muted-foreground text-xs">({row.reviewCount})</span>
        </span>
      )
    },
    {
      key: 'isNew', label: 'Tags',
      render: row => (
        <div className="flex gap-1">
          {row.isNew && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded">NEW</span>}
          {row.isSale && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-500/20 text-orange-400 rounded">SALE</span>}
        </div>
      )
    },
  ];

  const handleAdd = () => {
    setEditing({ ...EMPTY, id: `p${Date.now()}` });
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (row: Product) => {
    setEditing({ ...row });
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (row: Product) => {
    setProducts(prev => prev.filter(p => p.id !== row.id));
    toast.success(`"${row.name}" deleted successfully`);
  };

  const handleSave = () => {
    if (!editing.name?.trim()) { toast.error('Name is required'); return; }
    if (isEdit) {
      setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...editing } as Product : p));
      toast.success('Product updated successfully');
    } else {
      setProducts(prev => [editing as Product, ...prev]);
      toast.success('Product added successfully');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" /> Product Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{products.length} total products</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="glass border border-white/5 rounded-2xl p-5">
        <DataTable
          data={products}
          columns={columns}
          searchKeys={['name', 'nameFa', 'category', 'brand'] as (keyof Product)[]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEdit ? 'Edit Product' : 'Add New Product'}
        onSubmit={handleSave}
        submitLabel={isEdit ? 'Update Product' : 'Add Product'}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Name (English)" required>
            <FormInput value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} />
          </FormField>
          <FormField label="Name (Persian)">
            <FormInput value={editing.nameFa || ''} onChange={e => setEditing(p => ({ ...p, nameFa: e.target.value }))} className="font-rtl text-right" />
          </FormField>
          <FormField label="Brand" required>
            <FormInput value={editing.brand || ''} onChange={e => setEditing(p => ({ ...p, brand: e.target.value }))} />
          </FormField>
          <FormField label="Category" required>
            <FormInput value={editing.category || ''} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))} />
          </FormField>
          <FormField label="Price (USD)" required>
            <FormInput type="number" min="0" step="0.01" value={editing.price || ''} onChange={e => setEditing(p => ({ ...p, price: parseFloat(e.target.value) }))} />
          </FormField>
          <FormField label="Original Price (before discount)">
            <FormInput type="number" min="0" step="0.01" value={editing.originalPrice || ''} onChange={e => setEditing(p => ({ ...p, originalPrice: parseFloat(e.target.value) }))} />
          </FormField>
          <FormField label="Stock" required>
            <FormInput type="number" min="0" value={editing.stock || ''} onChange={e => setEditing(p => ({ ...p, stock: parseInt(e.target.value) }))} />
          </FormField>
          <FormField label="Rating (0–5)">
            <FormInput type="number" min="0" max="5" step="0.1" value={editing.rating || ''} onChange={e => setEditing(p => ({ ...p, rating: parseFloat(e.target.value) }))} />
          </FormField>
          <FormField label="Thumbnail URL">
            <FormInput value={editing.thumbnail || ''} onChange={e => setEditing(p => ({ ...p, thumbnail: e.target.value }))} placeholder="https://..." />
          </FormField>
          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!editing.isNew} onChange={e => setEditing(p => ({ ...p, isNew: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <span className="text-sm text-foreground/80">Mark as New</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!editing.isSale} onChange={e => setEditing(p => ({ ...p, isSale: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <span className="text-sm text-foreground/80">On Sale</span>
            </label>
          </div>
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
