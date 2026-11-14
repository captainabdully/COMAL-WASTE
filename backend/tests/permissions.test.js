import assert from 'node:assert/strict';
import test from 'node:test';

process.env.DATABASE_URL ||= 'postgres://u:p@localhost/db';

test('every default role permission exists in the catalogue', async () => {
  const { PERMISSION_KEYS, SYSTEM_ROLES } = await import('../config/permissions.js');
  for (const [role, def] of Object.entries(SYSTEM_ROLES)) {
    for (const p of def.permissions) assert.ok(PERMISSION_KEYS.includes(p), `${role} has unknown permission ${p}`);
  }
  assert.deepEqual([...SYSTEM_ROLES.admin.permissions].sort(), [...PERMISSION_KEYS].sort());
});

test('requirePermission rejects a user without an account before touching routes', async () => {
  const { requirePermission } = await import('../middleware/permissionMiddleware.js');
  let status;
  const res = { status(code) { status = code; return this; }, json() { return this; } };
  await requirePermission('users.manage')({ user: undefined }, res, () => assert.fail('should not call next'));
  assert.equal(status, 403);
});

test('role admin routes are guarded by roles.manage', async () => {
  const { readFile } = await import('node:fs/promises');
  const src = await readFile(new URL('../routes/rbacRoutes.js', import.meta.url), 'utf8');
  assert.equal((src.match(/requirePermission\('roles\.manage'\)/g) || []).length, 3);
});
