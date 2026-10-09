import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';

describe('Backend Blood Unit Inventory API Tests', () => {
  const app = createApp();
  let authToken = '';

  before(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@nexus.org',
        password: 'Admin123!',
      });
    authToken = loginRes.body.data.token;
  });

  after(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/blood-units with status filter returns paginated units', async () => {
    const res = await request(app)
      .get('/api/blood-units?status=AVAILABLE&page=1&limit=5')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.items));
    assert.ok(res.body.data.pagination);
    assert.equal(res.body.data.pagination.page, 1);
    assert.equal(res.body.data.pagination.limit, 5);

    for (const item of res.body.data.items) {
      assert.equal(item.status, 'AVAILABLE');
    }
  });

  test('GET /api/blood-units fails without authentication', async () => {
    const res = await request(app).get('/api/blood-units');
    assert.equal(res.status, 401);
  });
});