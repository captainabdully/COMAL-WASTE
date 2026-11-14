import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable } from './DataTable';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { confirmAction, showError, showSuccess } from '../lib/alerts';

interface RoleInfo { name: string; label: string; description?: string; permissions: string[]; }
interface UserRow {
  user_id: string; name: string; email: string; phone_number?: string;
  user_roles: string[]; is_active: boolean; created_at: string;
}

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
};

const roleChip = 'inline-block px-2 py-0.5 mr-1 rounded-full text-xs font-medium bg-green-100 text-green-800';


const RolePicker = ({ roles, can, selected, onToggle }: { roles: RoleInfo[]; can: (p: string) => boolean; selected: string[]; onToggle: (r: string) => void }) => {
  const grantable = (role: RoleInfo) => role.permissions.every((p) => can(p));
  return (
  <div className="space-y-2 max-h-56 overflow-y-auto">
    {roles.map((role) => {
      const allowed = grantable(role) || selected.includes(role.name);
      return (
        <label key={role.name} className={`flex items-start gap-3 p-3 border rounded-lg ${allowed ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50'}`}>
          <input type="checkbox" className="mt-1" checked={selected.includes(role.name)} disabled={!grantable(role) && !selected.includes(role.name)} onChange={() => onToggle(role.name)} />
          <span>
            <span className="font-medium">{role.label}</span>
            <span className="block text-xs text-gray-500">{role.description || `${role.permissions.length} permissions`}{!allowed && ' · more access than you have'}</span>
          </span>
        </label>
      );
    })}
  </div>
);
};

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      {children}
    </div>
  </div>
);

const PasswordField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="flex gap-2">
    <input type="text" required minLength={8} placeholder="Temporary password (min 8 characters)" className="flex-1 px-4 py-2 border rounded-lg font-mono" value={value} onChange={(e) => onChange(e.target.value)} />
    <button type="button" className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm" onClick={() => onChange(generatePassword())}>Generate</button>
  </div>
);


export const UserManagement: React.FC = () => {
  const { user: me, can } = useAuth();
  const canManage = can('users.manage');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone_number: '', password: '', roles: [] as string[] });
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<UserRow | null>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [resetting, setResetting] = useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [u, r] = await Promise.all([api.get('/users'), api.get('/roles')]);
      setUsers(u.data.users || []);
      setRoles(r.data.roles || []);
    } catch (error) {
      await showError('Could not load users', error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const roleLabel = useMemo(() => Object.fromEntries(roles.map((r) => [r.name, r.label])), [roles]);
  const toggle = (list: string[], role: string) => (list.includes(role) ? list.filter((r) => r !== role) : [...list, role]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.roles.length === 0) return void showError('Select at least one role');
    try {
      setSaving(true);
      await api.post('/users/admin-create', form);
      await showSuccess('User created', `Share the temporary password with ${form.name} securely.`);
      setShowCreate(false);
      setForm({ name: '', email: '', phone_number: '', password: '', roles: [] });
      await load();
    } catch (error) {
      await showError('Could not create user', error);
    } finally {
      setSaving(false);
    }
  };

  const saveRoles = async () => {
    if (!editing) return;
    try {
      setSaving(true);
      await api.put(`/users/${editing.user_id}/roles`, { roles: editRoles });
      await showSuccess('Roles updated');
      setEditing(null);
      await load();
    } catch (error) {
      await showError('Could not update roles', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: UserRow) => {
    const next = !row.is_active;
    if (!next && !(await confirmAction(`Deactivate ${row.name}?`, 'They will be signed out of every app and unable to log in until reactivated.'))) return;
    try {
      await api.put(`/users/${row.user_id}/status`, { is_active: next });
      await showSuccess(next ? 'User activated' : 'User deactivated');
      await load();
    } catch (error) {
      await showError('Could not change status', error);
    }
  };

  const submitReset = async () => {
    if (!resetting) return;
    try {
      setSaving(true);
      await api.post(`/users/${resetting.user_id}/reset-password`, { newPassword });
      await showSuccess('Password reset', `Share the new password with ${resetting.name} securely.`);
      setResetting(null);
      setNewPassword('');
    } catch (error) {
      await showError('Could not reset password', error);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: UserRow) => {
    if (!(await confirmAction(`Delete ${row.name}?`, 'This cannot be undone. Users with pickup orders must be deactivated instead.'))) return;
    try {
      await api.delete(`/users/${row.user_id}`);
      await showSuccess('User deleted');
      await load();
    } catch (error) {
      await showError('Could not delete user', error);
    }
  };

  const rows = users.map((u) => ({ ...u, roleText: (u.user_roles || []).join(' '), statusText: u.is_active === false ? 'inactive' : 'active' }));

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone_number', label: 'Phone' },
    {
      key: 'roleText', label: 'Roles',
      render: (_: unknown, row: UserRow) => (
        <>{(row.user_roles || []).map((r) => <span key={r} className={roleChip}>{roleLabel[r] || r}</span>)}</>
      ),
    },
    {
      key: 'statusText', label: 'Status',
      render: (_: unknown, row: UserRow) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${row.is_active === false ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'}`}>
          {row.is_active === false ? 'Inactive' : 'Active'}
        </span>
      ),
    },
    { key: 'created_at', label: 'Created', render: (v: string) => (v ? new Date(v).toLocaleDateString() : '') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        {canManage && (
          <button onClick={() => setShowCreate(true)} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">+ Add User</button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4">Loading users...</div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          actions={canManage ? (row: UserRow) => {
            const self = row.user_id === me?.user_id;
            return (
              <div className="flex gap-3 justify-end">
                <button disabled={self} onClick={() => { setEditing(row); setEditRoles(row.user_roles || []); }} className="text-blue-600 hover:text-blue-800 disabled:text-gray-300">Roles</button>
                <button onClick={() => setResetting(row) } className="text-amber-600 hover:text-amber-800">Reset password</button>
                <button disabled={self} onClick={() => toggleActive(row)} className="text-gray-700 hover:text-gray-900 disabled:text-gray-300">{row.is_active === false ? 'Activate' : 'Deactivate'}</button>
                <button disabled={self} onClick={() => remove(row)} className="text-red-600 hover:text-red-800 disabled:text-gray-300">Delete</button>
              </div>
            );
          } : undefined}
        />
      )}

      {showCreate && (
        <Modal title="Add User" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <input required placeholder="Full name" className="w-full px-4 py-2 border rounded-lg" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input type="tel" placeholder="Phone number" className="w-full px-4 py-2 border rounded-lg" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
            <PasswordField value={form.password} onChange={(password) => setForm({ ...form, password })} />
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Roles</p>
              <RolePicker roles={roles} can={can} selected={form.roles} onToggle={(r) => setForm({ ...form, roles: toggle(form.roles, r) })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button disabled={saving} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create User'}</button>
            </div>
          </form>
        </Modal>
      )}

      {editing && (
        <Modal title={`Roles for ${editing.name}`} onClose={() => setEditing(null)}>
          <RolePicker roles={roles} can={can} selected={editRoles} onToggle={(r) => setEditRoles(toggle(editRoles, r))} />
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-gray-600">Cancel</button>
            <button disabled={saving || editRoles.length === 0} onClick={saveRoles} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Save Roles</button>
          </div>
        </Modal>
      )}

      {resetting && (
        <Modal title={`Reset password for ${resetting.name}`} onClose={() => setResetting(null)}>
          <PasswordField value={newPassword} onChange={setNewPassword} />
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setResetting(null)} className="px-4 py-2 text-gray-600">Cancel</button>
            <button disabled={saving || newPassword.length < 8} onClick={submitReset} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50">Reset Password</button>
          </div>
        </Modal>
      )}
    </div>
  );
};
