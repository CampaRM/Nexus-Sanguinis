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

  test('POST /api/auth/register with valid credentials creates user', async () => {
    const testEmail = `doctor_${Date.now()}@nexus.org`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'Dr. Test Register',
        email: testEmail,
        password: 'Password123!',
        id_role: 1,
        id_medical_center: 1,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.role, 'ADMIN_GENERAL');
    assert.equal(res.body.data.user.id_medical_center, 1);
  });

  test('POST /api/auth/register defaults to role 2 (BANK_MANAGER) when id_role is null or omitted', async () => {
    const testEmail = `manager_${Date.now()}@nexus.org`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'Dr. Auto Manager',
        email: testEmail,
        password: 'Password123!',
        id_role: null,
        id_medical_center: 2,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.role, 'BANK_MANAGER');
  });

  test('POST /api/auth/register returns 400 with "Rol o centro médico no válido" on invalid foreign key', async () => {
    const testEmail = `invalid_center_${Date.now()}@nexus.org`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'Dr. Invalid Center',
        email: testEmail,
        password: 'Password123!',
        id_role: 1,
        id_medical_center: 999999,
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'Rol o centro médico no válido');
  });
});