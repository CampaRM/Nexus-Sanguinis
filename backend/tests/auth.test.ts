import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';

describe('Backend Auth API Tests', () => {
  const app = createApp();

  after(async () => {
    await prisma.$disconnect();
  });

  test('POST /api/auth/login with valid credentials returns JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@nexus.org',
        password: 'Admin123!',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, 'admin@nexus.org');
    assert.equal(res.body.data.user.role, 'ADMIN_GENERAL');
  });

  test('POST /api/auth/login with invalid credentials returns 401 unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@nexus.org',
        password: 'WrongPassword999!',
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });
});