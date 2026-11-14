import { sql } from '../config/db.js';

// Permissions are read from the database, not the JWT, so role edits and
// deactivation take effect immediately. A short cache keeps this to ~1 query per user per few seconds.
const TTL_MS = 10_000;
const cache = new Map();

export const clearPermissionCache = () => cache.clear();

export async function getUserAccess(userId) {
  const hit = cache.get(userId);
  if (hit && hit.expires > Date.now()) return hit.value;

  const [user] = await sql`SELECT is_active FROM users WHERE user_id = ${userId} LIMIT 1`;
  let value = { active: false, roles: [], permissions: new Set() };
  if (user) {
    const roleRows = await sql`SELECT user_role FROM user_roles WHERE user_id = ${userId}`;
    const permRows = await sql`
      SELECT DISTINCT rp.permission
      FROM user_roles ur
      JOIN role_permissions rp ON rp.role_name = ur.user_role
      WHERE ur.user_id = ${userId}
    `;
    value = {
      active: user.is_active !== false,
      roles: roleRows.map((r) => r.user_role),
      permissions: new Set(permRows.map((r) => r.permission)),
    };
  }
  cache.set(userId, { value, expires: Date.now() + TTL_MS });
  return value;
}

// Allows the request when the user holds ANY of the listed permissions.
// Attaches req.permissions (Set) and req.access for controllers that need finer checks.
export const requirePermission = (...needed) => async (req, res, next) => {
  try {
    const access = req.user?.user_id ? await getUserAccess(req.user.user_id) : null;
    if (!access || !access.active) {
      return res.status(403).json({ message: 'Forbidden: account is inactive or unknown' });
    }
    req.access = access;
    req.permissions = access.permissions;
    if (needed.length && !needed.some((p) => access.permissions.has(p))) {
      return res.status(403).json({ message: 'Forbidden: you do not have permission to do this' });
    }
    next();
  } catch (error) {
    console.error('Permission check failed:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
