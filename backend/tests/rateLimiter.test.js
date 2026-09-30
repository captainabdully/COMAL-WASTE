import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import express from 'express';
import { authLimiter, passwordRecoveryLimiter } from '../middleware/rateLimiter.js';

test('successful logins do not consume failed-login allowance; recovery has its own limit', async () => {
  const app = express();
  app.post('/login', authLimiter, (req, res) => {
    res.sendStatus(req.query.fail ? 400 : 200);
  });
  app.post('/forgot-password', passwordRecoveryLimiter, (_req, res) => res.sendStatus(200));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = async (path) => {
    const response = await fetch(`${base}${path}`, { method: 'POST' });
    await response.text();
    return response;
  };
  try {
    for (let i = 0; i < 15; i++) {
      assert.equal((await post('/login')).status, 200);
    }
    for (let i = 0; i < 10; i++) {
      assert.equal((await post('/forgot-password')).status, 200);
    }
    assert.equal((await post('/forgot-password')).status, 429);
    assert.equal((await post('/login')).status, 200);
    for (let i = 0; i < 10; i++) {
      assert.equal((await post('/login?fail=1')).status, 400);
    }
    const blocked = await post('/login?fail=1');
    assert.equal(blocked.status, 429);
    assert.ok(Number(blocked.headers.get('retry-after')) > 0);
  } finally {
    await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  }
});
