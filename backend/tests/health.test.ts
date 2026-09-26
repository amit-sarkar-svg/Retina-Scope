import request from 'supertest';
import app from '../src/app';

describe('GET /api/health', () => {
  it('should return 200 and health check payload', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      service: 'RETINASCOPE API',
      status: 'ok',
    });
  });

  it('should return 404 for non-existent route with standardized error format', async () => {
    const response = await request(app).get('/api/non-existent-endpoint');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
