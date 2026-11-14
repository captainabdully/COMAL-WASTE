import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { confirmAction, showError, showSuccess } from '../lib/alerts';

interface RoleInfo {
  name: string; label: string; description?: string; is_system: boolean; locked: boolean;
  permissions: string[]; user_count: number;
}
interface PermissionInfo { key: string; group: string; label: string; }

export const RolesMatrix: React.FC = () => {
  const { can } = useAuth();
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [permissions, setPermissions] = useState<PermissionInfo[]>([]);
  const [draft, setDraft] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', label: '', description: '' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/roles');
      setRoles(res.data.roles);
      setPermissions(res.data.permissions);
      setDraft(Object.fromEntries(res.data.roles.map((r: RoleInfo) => [r.name, r.permissions])));
    } catch (error) {
      await showError('Could not load roles', error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const groups = useMemo(() => {
    const map = new Map<string, PermissionInfo[]>();
    permissions.forEach((p) => map.set(p.group, [...(map.get(p.group) || []), p]));
    return [...map.entries()];
  }, [permissions]);

  const dirtyRoles = roles.filter((r) => {
    const a = [...(draft[r.name] || [])].sort().join('|');
    const b = [...r.permissions].sort().join('|');
    return a !== b;
  });

  const toggle = (role: string, perm: string) =>
    setDraft((d) => ({ ...d, [role]: d[role].includes(perm) ? d[role].filter((p) => p !== perm) : [...d[role], perm] }));

  const saveAll = async () => {
    try {
      setSaving(true);
      for (const r of dirtyRoles) await api.put(`/roles/${r.name}`, { permissions: draft[r.name] });
      await showSuccess('Permissions saved');
      await load();
    } catch (error) {
      await showError('Could not save permissions', error);
    } finally {
      setSaving(false);
    }
  };

  const createRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/roles', { ...newRole, permissions: [] });
      await showSuccess('Role created', 'Now tick the permissions it should have and save.');
      setShowNew(false);
      setNewRole({ name: '', label: '', description: '' });
      await load();
    } catch (error) {
      await showError('Could not create role', error);
    }
  };

  const deleteRole = async (role: RoleInfo) => {
    if (!(await confirmAction(`Delete the "${role.label}" role?`, 'This cannot be undone.'))) return;
    try {
      await api.delete(`/roles/${role.name}`);
      await showSuccess('Role deleted');
      await load();
    } catch (error) {
      await showError('Could not delete role', error);
    }
  };

  if (loading) return <div className="text-center py-4">Loading roles...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Roles & Permissions</h2>
          <p className="text-sm text-gray-500">Tick what each role may do. Changes apply to users within seconds of saving.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowNew(true)} className="px-5 py-2 border border-green-600 text-green-700 rounded-lg hover:bg-green-50">+ New Role</button>
          <button disabled={!dirtyRoles.length || saving} onClick={saveAll} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40">
            {saving ? 'Saving...' : `Save changes${dirtyRoles.length ? ` (${dirtyRoles.length})` : ''}`}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase text-xs">Permission</th>
              {roles.map((r) => (
                <th key={r.name} className="px-4 py-3 text-center min-w-[120px]">
                  <div className="font-semibold text-gray-900">{r.label}</div>
                  <div className="text-xs font-normal text-gray-500">{r.user_count} user{r.user_count === 1 ? '' : 's'}</div>
                  {!r.is_system && (
                    <button onClick={() => deleteRole(r)} className="mt-1 text-xs text-red-600 hover:text-red-800">Delete</button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map(([group, perms]) => (
              <React.Fragment key={group}>
                <tr className="bg-gray-100"><td colSpan={roles.length + 1} className="px-4 py-2 text-xs font-semibold uppercase text-gray-600">{group}</td></tr>
                {perms.map((p) => (
                  <tr key={p.key} className="border-t">
                    <td className="px-4 py-3">
                      <div className="text-gray-900">{p.label}</div>
                      <div className="text-xs text-gray-400 font-mono">{p.key}</div>
                    </td>
                    {roles.map((r) => {
                      const checked = (draft[r.name] || []).includes(p.key);
                      // You cannot grant a permission you do not hold yourself.
                      const disabled = r.locked || (!checked && !can(p.key)) || (checked && !can(p.key));
                      return (
                        <td key={r.name} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-green-600"
                            checked={checked}
                            disabled={disabled}
                            title={r.locked ? 'The admin role always has every permission' : disabled ? 'You do not hold this permission' : ''}
                            onChange={() => toggle(r.name, p.key)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowNew(false)}>
          <form onSubmit={createRole} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">New Role</h3>
            <input required placeholder="Display name (e.g. Dispatcher)" className="w-full px-4 py-2 border rounded-lg" value={newRole.label}
              onChange={(e) => setNewRole({ ...newRole, label: e.target.value, name: newRole.name || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30) })} />
            <input required placeholder="Identifier (e.g. dispatcher)" pattern="[a-z][a-z0-9_\-]{1,29}" title="Lowercase letters, numbers, - or _; start with a letter" className="w-full px-4 py-2 border rounded-lg font-mono" value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value.toLowerCase() })} />
            <input placeholder="Description (optional)" className="w-full px-4 py-2 border rounded-lg" value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Create Role</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
