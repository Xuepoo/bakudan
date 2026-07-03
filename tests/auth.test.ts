import { expect, test } from 'vitest';
import { onRequest } from '../functions/api/auth/me';

test('returns 401 when token cookie is missing', async () => {
  const mockContext = {
    request: new Request('http://localhost/api/auth/me', {
      headers: {},
    }),
  };
  const response = await onRequest(mockContext);
  expect(response.status).toBe(401);
  const data = await response.json();
  expect(data).toEqual({ authenticated: false });
});

test('returns mock user info when token cookie is present', async () => {
  const mockContext = {
    request: new Request('http://localhost/api/auth/me', {
      headers: {
        Cookie: 'token=mock_token_value',
      },
    }),
  };
  const response = await onRequest(mockContext);
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data).toEqual({ authenticated: true, user: { username: 'mock' } });
});
