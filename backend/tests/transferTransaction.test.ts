import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';

describe('Backend ACID Transfer Transaction API Tests', () => {
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

  test('POST /api/transfers and POST /api/transfers/:id/process executes ACID transaction', async () => {
    // 1. Create transfer request: Center 2 requests 1 unit of type 'O' from Center 1
    const createRes = await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        id_requesting_center: 2,
        id_supplying_center: 1,
        blood_type: 'O',
        quantity: 1,
      });

    assert.equal(createRes.status, 201);
    assert.equal(createRes.body.success, true);
    const transferId = createRes.body.data.id_transfer_request;
    assert.ok(transferId);
    assert.equal(createRes.body.data.status, 'PENDING');

    // 2. Process / Approve transfer with ACID transaction
    const processRes = await request(app)
      .post(`/api/transfers/${transferId}/process`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        action: 'APPROVE',
      });

    assert.equal(processRes.status, 200);
    assert.equal(processRes.body.success, true);
    assert.equal(processRes.body.data.status, 'COMPLETED');
    assert.ok(processRes.body.data.transfer_details.length > 0);

    const transferredUnitId = processRes.body.data.transfer_details[0].id_blood_unit;

    // 3. Verify unit now belongs to requesting center 2 in the database
    const unitInDb = await prisma.bloodUnit.findUnique({
      where: { id_blood_unit: transferredUnitId },
    });
    assert.equal(unitInDb?.id_medical_center, 2);

    // 4. Verify movement history entry was logged
    const movement = await prisma.movementHistory.findFirst({
      where: { id_blood_unit: transferredUnitId },
      orderBy: { timestamp: 'desc' },
    });
    assert.ok(movement);
    assert.ok(movement.action.includes('TRANSFER_COMPLETED'));
  });
});