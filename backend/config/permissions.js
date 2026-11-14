// Single source of truth for what a role can be allowed to do.
// Roles and their granted permissions live in the database (roles / role_permissions);
// this file only defines the catalogue and the defaults seeded for the built-in roles.

export const PERMISSIONS = [
  { key: 'portal.access', group: 'Admin portal', label: 'Sign in to the admin portal' },
  { key: 'reports.view', group: 'Admin portal', label: 'View dashboard, reports, financial and fleet pages' },

  { key: 'orders.create', group: 'Pickup requests', label: 'Create pickup requests' },
  { key: 'orders.view_own', group: 'Pickup requests', label: 'View own pickup requests' },
  { key: 'orders.cancel_own', group: 'Pickup requests', label: 'Cancel own pending requests' },
  { key: 'orders.view_all', group: 'Pickup requests', label: 'View all pickup requests' },
  { key: 'orders.manage', group: 'Pickup requests', label: 'Approve, reject and complete requests' },

  { key: 'prices.manage', group: 'Prices & locations', label: 'Set and delete daily prices' },
  { key: 'dropping_points.manage', group: 'Prices & locations', label: 'Create, edit and delete dropping points' },

  { key: 'users.view', group: 'Users & roles', label: 'View the user list' },
  { key: 'users.manage', group: 'Users & roles', label: 'Create, edit, deactivate, delete users and reset passwords' },
  { key: 'roles.manage', group: 'Users & roles', label: 'Create roles and edit the permission matrix' },
];

export const PERMISSION_KEYS = PERMISSIONS.map((p) => p.key);

export const SYSTEM_ROLES = {
  admin: {
    label: 'Admin',
    description: 'Full access. Always has every permission.',
    permissions: PERMISSION_KEYS,
  },
  manager: {
    label: 'Manager',
    description: 'Runs day-to-day operations in the admin portal.',
    permissions: ['portal.access', 'reports.view', 'orders.view_all', 'orders.manage', 'prices.manage', 'dropping_points.manage', 'users.view'],
  },
  vendor: {
    label: 'Vendor',
    description: 'Sells scrap through the vendor app.',
    permissions: ['orders.create', 'orders.view_own', 'orders.cancel_own'],
  },
};

// Roles whose permission set can never be edited (prevents locking everyone out).
export const LOCKED_ROLES = ['admin'];
