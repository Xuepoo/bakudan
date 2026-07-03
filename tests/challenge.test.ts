import { expect, test } from 'vitest';
import { onRequest } from '../functions/api/verify/challenge';
import { HMAC } from '../src/crypto';

test('generates challenge with correct bounds and valid signature', async () => {
  const secret = 'test_env_secret';
  const mockContext = {
    env: {
      CAPTCHA_SECRET: secret,
    },
  };

  const response = await onRequest(mockContext);
  expect(response.status).toBe(200);
  expect(response.headers.get('Content-Type')).toBe('application/json');

  const data = await response.json();
  expect(data).toHaveProperty('challengeId');
  expect(data).toHaveProperty('gBase');
  expect(data).toHaveProperty('gAmp');
  expect(data).toHaveProperty('gFreq');
  expect(data).toHaveProperty('windCoeff');
  expect(data).toHaveProperty('hmac');

  // Check bounds
  expect(data.gBase).toBeGreaterThanOrEqual(8.5);
  expect(data.gBase).toBeLessThanOrEqual(11.5);

  expect(data.gAmp).toBeGreaterThanOrEqual(1.0);
  expect(data.gAmp).toBeLessThanOrEqual(3.0);

  expect(data.gFreq).toBeGreaterThanOrEqual(0.5);
  expect(data.gFreq).toBeLessThanOrEqual(2.0);

  expect(data.windCoeff).toBeGreaterThanOrEqual(0.05);
  expect(data.windCoeff).toBeLessThanOrEqual(0.2);

  // Verify HMAC signature matches
  const payload = `${data.challengeId}:${Number(data.gBase).toFixed(4)}:${Number(data.gAmp).toFixed(4)}:${Number(data.gFreq).toFixed(4)}:${Number(data.windCoeff).toFixed(4)}`;
  const expectedHmac = await HMAC.generate(payload, secret);
  expect(data.hmac).toBe(expectedHmac);
});

test('uses fallback secret when CAPTCHA_SECRET is not provided', async () => {
  const mockContext = {
    env: {},
  };

  const response = await onRequest(mockContext);
  const data = await response.json();

  const payload = `${data.challengeId}:${Number(data.gBase).toFixed(4)}:${Number(data.gAmp).toFixed(4)}:${Number(data.gFreq).toFixed(4)}:${Number(data.windCoeff).toFixed(4)}`;
  const expectedHmac = await HMAC.generate(payload, 'fallback_secret');
  expect(data.hmac).toBe(expectedHmac);
});
