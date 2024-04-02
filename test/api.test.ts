import request from 'supertest';

import app from '../src/app';

describe('GET /api/user', () => {
  it('should return 200 OK', () => {
    return request(app).get('/api/v1/user')
      .expect(200);
  });
});

describe('GET /api/v1/user/:id', () => {
  it('should return 200 OK', () => {
    return request(app).get('/api/v1/user/1')
      .expect(200);
  });
},
);

describe('POST /api/v1/user', () => {
  it('should return 201 Created', () => {
    const data = {
      username: 'test',
      password: 'test',
      email: 'test@gmail.com',
    };
    return request(app).post('/api/v1/user')
      .send(data)
      .expect(201);
  });
});

describe('PUT /api/v1/user/:id', () => {
  it('should return 200 OK', () => {
    const data = {
      username: 'test',
      password: 'test',
      email: 'test@gmail.com',
    };
    return request(app).put('/api/v1/user/1')
      .send(data)
      .expect(200);
  });
});

describe('DELETE /api/v1/user/:id', () => {
  it('should return 200 OK', () => {
    return request(app).delete('/api/v1/user/1')
      .expect(200);
  });
},
);