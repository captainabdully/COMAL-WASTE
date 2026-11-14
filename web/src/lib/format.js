export const formatQuantity = (value) => {
  const quantity = Number(value);
  return Number.isFinite(quantity) ? quantity.toString() : String(value);
};

export const CANCELLED_RETENTION_DAYS = 3;

// Days left before a cancelled order is auto-deleted by the backend cleanup job.
export const daysUntilRemoval = (order) => {
  const from = new Date(order.rejection_commented_at || order.created_at).getTime();
  if (Number.isNaN(from)) return null;
  const left = CANCELLED_RETENTION_DAYS - (Date.now() - from) / 86400000;
  return Math.max(0, Math.ceil(left));
};

export const removalNotice = (order) => {
  const d = daysUntilRemoval(order);
  if (d === null) return '';
  if (d <= 0) return 'This request will be removed soon.';
  return `This request will be removed in ${d} day${d === 1 ? '' : 's'}.`;
};

export const formatTsh = (v) => `Tsh ${Number(v).toLocaleString()}`;
