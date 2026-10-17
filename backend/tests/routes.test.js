import assert from 'node:assert/strict';
import test from 'node:test';

process.env.DATABASE_URL ||= 'postgres://u:p@localhost/db';

test('static order routes are registered before the /:vendor_id catch-all', async () => {
  const { default: router } = await import('../routes/orderRoutes.js');
  const paths = router.stack.filter((l) => l.route?.methods.get).map((l) => l.route.path);
  assert.ok(paths.indexOf('/history/') !== -1 && paths.indexOf('/history/') < paths.indexOf('/:vendor_id'));
});

test('cors runs before the rate limiter in app.js', async () => {
  const { readFile } = await import('node:fs/promises');
  const src = await readFile(new URL('../app.js', import.meta.url), 'utf8');
  assert.ok(src.indexOf('app.use(cors(') < src.indexOf('app.use(apiLimiter)'));
});
