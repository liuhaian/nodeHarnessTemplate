import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '@/app.js';
import { userRepository } from '@/repositories/user.repository.js';

const app = createApp();

describe('users API', () => {
  afterEach(() => {
    userRepository._reset();
  });

  it('POST /api/v1/users creates a user', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ email: 'a@b.com', name: 'Alice', role: 'user' });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('a@b.com');
    expect(res.body.id).toBeDefined();
  });

  it('POST /api/v1/users returns 400 on invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ email: 'not-email', name: 'x', role: 'user' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/users returns 409 on duplicate', async () => {
    await request(app).post('/api/v1/users').send({ email: 'dup@x.com', name: 'A', role: 'user' });
    const res = await request(app)
      .post('/api/v1/users')
      .send({ email: 'dup@x.com', name: 'B', role: 'user' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('GET /api/v1/users returns paginated result', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/v1/users')
        .send({ email: `u${i}@x.com`, name: `U${i}`, role: 'user' });
    }
    const res = await request(app).get('/api/v1/users?limit=2');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body).toHaveProperty('nextCursor');
  });

  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('unknown route returns 404 with structured error', async () => {
    const res = await request(app).get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
