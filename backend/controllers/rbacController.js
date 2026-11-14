import { sql } from '../config/db.js';
import { PERMISSIONS, PERMISSION_KEYS, LOCKED_ROLES } from '../config/permissions.js';
import { clearPermissionCache } from '../middleware/permissionMiddleware.js';

const NAME_RE = /^[a-z][a-z0-9_-]{1,29}$/;

const cleanPermissions = (list) => {
  if (!Array.isArray(list)) return null;
  const unique = [...new Set(list)];
  return unique.every((p) => PERMISSION_KEYS.includes(p)) ? unique : null;
};

async function loadRoles() {
  const roles = await sql`
    SELECT r.name, r.label, r.description, r.is_system,
      COALESCE((SELECT json_agg(rp.permission ORDER BY rp.permission) FROM role_permissions rp WHERE rp.role_name = r.name), '[]') AS permissions,
      (SELECT COUNT(*)::int FROM user_roles ur WHERE ur.user_role = r.name) AS user_count
    FROM roles r
    ORDER BY r.is_system DESC, r.created_at, r.name
  `;
  return roles.map((r) => ({ ...r, locked: LOCKED_ROLES.includes(r.name) }));
}

export const listRoles = async (_req, res) => {
  try {
    res.json({ roles: await loadRoles(), permissions: PERMISSIONS });
  } catch (error) {
    console.error('List roles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// A caller may only grant permissions they hold themselves, so nobody can create a role
// more powerful than their own.
const exceedsCaller = (req, permissions) => permissions.some((p) => !req.permissions.has(p));

export const createRole = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim().toLowerCase();
    const label = String(req.body.label || '').trim();
    const description = String(req.body.description || '').trim() || null;
    const permissions = cleanPermissions(req.body.permissions ?? []);

    if (!NAME_RE.test(name)) {
      return res.status(400).json({ message: 'Role name must be 2-30 characters: lowercase letters, numbers, - or _, starting with a letter' });
    }
    if (!label) return res.status(400).json({ message: 'Role label is required' });
    if (!permissions) return res.status(400).json({ message: 'Unknown permission in request' });
    if (exceedsCaller(req, permissions)) return res.status(403).json({ message: 'You cannot grant permissions you do not have' });

    const inserted = await sql`
      INSERT INTO roles (name, label, description) VALUES (${name}, ${label}, ${description})
      ON CONFLICT (name) DO NOTHING RETURNING name
    `;
    if (!inserted.length) return res.status(409).json({ message: 'A role with this name already exists' });
    for (const permission of permissions) {
      await sql`INSERT INTO role_permissions (role_name, permission) VALUES (${name}, ${permission})`;
    }
    clearPermissionCache();
    res.status(201).json({ message: 'Role created', role: (await loadRoles()).find((r) => r.name === name) });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { name } = req.params;
    const [role] = await sql`SELECT name, is_system FROM roles WHERE name = ${name}`;
    if (!role) return res.status(404).json({ message: 'Role not found' });

    const label = req.body.label === undefined ? null : String(req.body.label).trim();
    if (label === '') return res.status(400).json({ message: 'Role label cannot be empty' });
    const description = req.body.description === undefined ? null : String(req.body.description).trim();

    if (label !== null || description !== null) {
      await sql`UPDATE roles SET label = COALESCE(${label}, label), description = COALESCE(${description}, description) WHERE name = ${name}`;
    }

    if (req.body.permissions !== undefined) {
      if (LOCKED_ROLES.includes(name)) {
        return res.status(400).json({ message: 'The admin role always has every permission and cannot be edited' });
      }
      const permissions = cleanPermissions(req.body.permissions);
      if (!permissions) return res.status(400).json({ message: 'Unknown permission in request' });

      // Only permissions that actually change need the caller to hold them.
      const current = (await sql`SELECT permission FROM role_permissions WHERE role_name = ${name}`).map((r) => r.permission);
      const changed = [...permissions.filter((p) => !current.includes(p)), ...current.filter((p) => !permissions.includes(p))];
      if (exceedsCaller(req, changed)) return res.status(403).json({ message: 'You cannot change permissions you do not have' });

      await sql`DELETE FROM role_permissions WHERE role_name = ${name}`;
      for (const permission of permissions) {
        await sql`INSERT INTO role_permissions (role_name, permission) VALUES (${name}, ${permission})`;
      }
    }
    clearPermissionCache();
    res.json({ message: 'Role updated', role: (await loadRoles()).find((r) => r.name === name) });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { name } = req.params;
    const [role] = await sql`SELECT name, is_system FROM roles WHERE name = ${name}`;
    if (!role) return res.status(404).json({ message: 'Role not found' });
    if (role.is_system) return res.status(400).json({ message: 'Built-in roles cannot be deleted' });

    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM user_roles WHERE user_role = ${name}`;
    if (count > 0) return res.status(409).json({ message: `${count} user(s) still have this role. Reassign them first.` });

    await sql`DELETE FROM roles WHERE name = ${name}`;
    clearPermissionCache();
    res.json({ message: 'Role deleted' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
