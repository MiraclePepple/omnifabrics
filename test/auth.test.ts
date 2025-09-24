import request from 'supertest';
import app from '../src/app';

describe('Auth Routes', () => {
  it('should signup a user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: '123456',
        phone_number: '09000000000'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBeDefined();
  });

  it('should login a user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: '123456'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should send OTP', async () => {
    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ email: 'test@example.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body.otp).toBeDefined();
  });
});
