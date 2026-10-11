import { useState } from 'react';
import { Plus, Users, Shield, UserCheck, UserX } from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import FormModal, { FormField, FormInput, FormSelect } from '@/components/admin/FormModal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'moderator' | 'admin' | 'super_admin';
  subscription: string;
  country: string;
  status: 'active' | 'suspended' | 'pending';
  joinedAt: string;
  avatar: string;
}

const MOCK_USERS: AdminUser[] = [
  { id: 'u1', name: 'Ahmad Karimi', email: 'ahmad@example.com', role: 'user', subscription: 'Yearly', country: 'Afghanistan', status: 'active', joinedAt: '2025-01-15', avatar: 'https://i.pravatar.cc/40?img=1' },
  { id: 'u2', name: 'Sara Ahmadi', email: 'sara@example.com', role: 'user', subscription: 'Monthly', country: 'Iran', status: 'active', joinedAt: '2025-02-20', avatar: 'https://i.pravatar.cc/40?img=2' },
  { id: 'u3', name: 'Reza Mohammadi', email: 'reza@example.com', role: 'moderator', subscription: 'Lifetime', country: 'Afghanistan', status: 'active', joinedAt: '2024-11-10', avatar: 'https://i.pravatar.cc/40?img=3' },
  { id: 'u4', name: 'Maryam Hosseini', email: 'maryam@example.com', role: 'user', subscription: 'None', country: 'Afghanistan', status: 'active', joinedAt: '2025-03-05', avatar: 'https://i.pravatar.cc/40?img=4' },
  { id: 'u5', name: 'Ali Hassan', email: 'ali@example.com', role: 'user', subscription: 'Quarterly', country: 'Pakistan', status: 'suspended', joinedAt: '2025-01-22', avatar: 'https://i.pravatar.cc/40?img=5' },
  { id: 'u6', name: 'Fatima Noor', email: 'fatima@example.com', role: 'admin', subscription: 'Lifetime', country: 'Afghanistan', status: 'active', joinedAt: '2024-09-01', avatar: 'https://i.pravatar.cc/40?img=6' },
  { id: 'u7', name: 'Omar Rashid', email: 'omar@example.com', role: 'user', subscription: 'Monthly', country: 'USA', status: 'active', joinedAt: '2025-04-12', avatar: 'https://i.pravatar.cc/40?img=7' },
  { id: 'u8', name: 'Nasrin Rahmani', email: 'nasrin@example.com', role: 'user', subscription: 'None', country: 'Iran', status: 'pending', joinedAt: '2025-05-30', avatar: 'https://i.pravatar.cc/40?img=8' },
];

const ROLE_LABELS: Record<string, string> = {
  user: 'User', moderator: 'Moderator', admin: 'Admin', super_admin: 'Super Admin'
};
const ROLE_COLORS: Record<string, string> = {
  user: 'bg-blue-500/20 text-blue-400',
  moderator: 'bg-purple-500/20 text-purple-400',
  admin: 'bg-orange-500/20 text-orange-400',
  super_admin: 'bg-primary/20 text-primary',
};
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  suspended: 'bg-red-500/20 text-red-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
};

const EMPTY: Partial<AdminUser> = {
  name: '', email: '', role: 'user', subscription: 'None', country: '', status: 'active',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<AdminUser>>(EMPTY);
  const [isEdit, setIsEdit] = useState(false);

  const activeCount = users.filter(u => u.status === 'active').length;
  const subCount = users.filter(u => u.subscription !== 'None').length;

  const columns: Column<AdminUser>[] = [
    {
      key: 'name', label: 'User', sortable: true,
      render: row => (
        <div className="flex items-center gap-2.5">
          <img src={row.avatar} alt={row.name} className="w-8 h-8 rounded-full object-cover" />
          <div>
            <p className="font-medium text-foreground text-sm">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: 'country', label: 'Country', sortable: true },
    {
      key: 'role', label: 'Role', sortable: true,
      render: row => (
        <span className={cn('flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-lg w-fit', ROLE_COLORS[row.role])}>
          <Shield className="w-2.5 h-2.5" /> {ROLE_LABELS[row.role]}
        </span>
      )
    },
    { key: 'subscription', label: 'Plan', sortable: true,
      render: row => (
        <span className={cn('px-2 py-0.5 text-[10px] font-medium rounded-lg',
          row.subscription !== 'None' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'
        )}>
          {row.subscription}
        </span>
      )
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: row => (
        <span className={cn('px-2 py-0.5 text-[10px] font-bold rounded-lg capitalize', STATUS_COLORS[row.status])}>
          {row.status}
        </span>
      )
    },
    { key: 'joinedAt', label: 'Joined', sortable: true },
  ];

  const handleAdd = () => {
    setEditing({ ...EMPTY, id: `u${Date.now()}`, avatar: `https://i.pravatar.cc/40?img=${Date.now() % 70}`, joinedAt: new Date().toISOString().split('T')[0] });
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (row: AdminUser) => {
    setEditing({ ...row });
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (row: AdminUser) => {
    setUsers(prev => prev.filter(u => u.id !== row.id));
    toast.success(`User "${row.name}" removed`);
  };

  const handleSave = () => {
    if (!editing.name?.trim() || !editing.email?.trim()) { toast.error('Name and email are required'); return; }
    if (isEdit) {
      setUsers(prev => prev.map(u => u.id === editing.id ? { ...u, ...editing } as AdminUser : u));
      toast.success('User updated successfully');
    } else {
      setUsers(prev => [editing as AdminUser, ...prev]);
      toast.success('User added successfully');
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> User Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{users.length} total · {activeCount} active · {subCount} subscribed</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: users.length, color: 'text-foreground' },
          { label: 'Active', value: activeCount, color: 'text-green-400' },
          { label: 'Subscribed', value: subCount, color: 'text-primary' },
          { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="glass border border-white/5 rounded-xl p-4 text-center">
            <p className={cn('text-2xl font-black', s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass border border-white/5 rounded-2xl p-5">
        <DataTable
          data={users}
          columns={columns}
          searchKeys={['name', 'email', 'country'] as (keyof AdminUser)[]}
          onEdit={handleEdit}
          onDelete={handleDelete}
          actions={(row) => (
            <div className="flex items-center justify-end gap-1.5">
              <button onClick={() => handleEdit(row)} className="px-2 py-1 text-xs font-medium glass rounded-lg border border-white/10 text-primary hover:bg-primary/10 transition-all">Edit</button>
              <button
                onClick={() => {
                  setUsers(prev => prev.map(u => u.id === row.id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
                  toast.success(`User ${row.status === 'active' ? 'suspended' : 'activated'}`);
                }}
                className={cn('px-2 py-1 text-xs font-medium glass rounded-lg border border-white/10 transition-all',
                  row.status === 'active' ? 'text-red-400 hover:bg-red-500/10 border-red-500/20' : 'text-green-400 hover:bg-green-500/10 border-green-500/20'
                )}
              >
                {row.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => handleDelete(row)} className="px-2 py-1 text-xs font-medium glass rounded-lg border border-white/10 text-destructive hover:bg-destructive/10 transition-all">Del</button>
            </div>
          )}
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEdit ? 'Edit User' : 'Add New User'}
        onSubmit={handleSave}
        submitLabel={isEdit ? 'Update User' : 'Add User'}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <FormInput value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} />
            </FormField>
            <FormField label="Email" required>
              <FormInput type="email" value={editing.email || ''} onChange={e => setEditing(p => ({ ...p, email: e.target.value }))} />
            </FormField>
            <FormField label="Role" required>
              <FormSelect value={editing.role || 'user'} onChange={e => setEditing(p => ({ ...p, role: e.target.value as AdminUser['role'] }))}>
                <option value="user" className="bg-card">User</option>
                <option value="moderator" className="bg-card">Moderator</option>
                <option value="admin" className="bg-card">Admin</option>
                <option value="super_admin" className="bg-card">Super Admin</option>
              </FormSelect>
            </FormField>
            <FormField label="Country">
              <FormInput value={editing.country || ''} onChange={e => setEditing(p => ({ ...p, country: e.target.value }))} placeholder="Afghanistan" />
            </FormField>
            <FormField label="Subscription Plan">
              <FormSelect value={editing.subscription || 'None'} onChange={e => setEditing(p => ({ ...p, subscription: e.target.value }))}>
                <option value="None" className="bg-card">None</option>
                <option value="Monthly" className="bg-card">Monthly</option>
                <option value="Quarterly" className="bg-card">3 Months</option>
                <option value="Yearly" className="bg-card">Yearly</option>
                <option value="Lifetime" className="bg-card">Lifetime</option>
              </FormSelect>
            </FormField>
            <FormField label="Status">
              <FormSelect value={editing.status || 'active'} onChange={e => setEditing(p => ({ ...p, status: e.target.value as AdminUser['status'] }))}>
                <option value="active" className="bg-card">Active</option>
                <option value="suspended" className="bg-card">Suspended</option>
                <option value="pending" className="bg-card">Pending</option>
              </FormSelect>
            </FormField>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
