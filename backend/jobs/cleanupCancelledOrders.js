import { sql } from '../config/db.js';

const RETENTION_DAYS = 3;
const INTERVAL_MS = 60 * 60 * 1000; // hourly

// Deletes orders cancelled more than RETENTION_DAYS ago.
// rejection_commented_at is set at cancellation time; fall back to created_at for legacy rows.
export async function deleteExpiredCancelledOrders() {
  try {
    const deleted = await sql`
      DELETE FROM pickup_order
      WHERE status = 'cancelled'
        AND COALESCE(rejection_commented_at, created_at) < NOW() - (${RETENTION_DAYS} * INTERVAL '1 day')
      RETURNING id
    `;
    if (deleted.length) console.log(`Cleanup: deleted ${deleted.length} cancelled order(s) older than ${RETENTION_DAYS} days`);
  } catch (error) {
    console.error('Cleanup of cancelled orders failed:', error);
  }
}

export function startCancelledOrderCleanup() {
  deleteExpiredCancelledOrders();
  setInterval(deleteExpiredCancelledOrders, INTERVAL_MS).unref();
}
