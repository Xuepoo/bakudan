import { expect, test } from 'vitest';
import { onRequestPost } from '../functions/api/verify/index';
import { HMAC } from '../src/crypto';

const secret = 'test_env_secret';

function generateValidPath(
  gBase: number,
  gAmp: number,
  gFreq: number,
  windCoeff: number,
  startY = 100,
  steps = 10,
  dtMs = 16,
) {
  const pathPoints = [];
  let t = 0;
  let y = startY;
  let vy = 0;

  pathPoints.push({ t, y, vy });

  for (let i = 0; i < steps; i++) {
    const dt = dtMs / 1000.0;
    const currentGravity = gBase + gAmp * Math.sin(gFreq * (t / 1000.0));
    const expectedVy = vy + (currentGravity - windCoeff * vy) * dt;
    y = y + expectedVy * dt;
    t = t + dtMs;
    vy = expectedVy;
    pathPoints.push({ t, y, vy });
  }
  return pathPoints;
}

test('verifies legitimate physical path successfully', async () => {
  const challengeId = crypto.randomUUID();
  const gBase = 9.81;
  const gAmp = 2.0;
  const gFreq = 1.0;
  const windCoeff = 0.1;

  const payload = `${challengeId}:${gBase.toFixed(4)}:${gAmp.toFixed(4)}:${gFreq.toFixed(4)}:${windCoeff.toFixed(4)}`;
  const hmac = await HMAC.generate(payload, secret);

  const pathPoints = generateValidPath(gBase, gAmp, gFreq, windCoeff);

  const request = new Request('http://localhost/api/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      challengeId,
      gBase,
      gAmp,
      gFreq,
      windCoeff,
      pathPoints,
      hmac,
    }),
  });

  const mockContext = {
    env: { CAPTCHA_SECRET: secret },
    request,
  };

  const response = await onRequestPost(mockContext);
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data).toEqual({ success: true });
});

test('rejects flat/linear trajectory with Physics mismatch', async () => {
  const challengeId = crypto.randomUUID();
  const gBase = 9.81;
  const gAmp = 2.0;
  const gFreq = 1.0;
  const windCoeff = 0.1;

  const payload = `${challengeId}:${gBase.toFixed(4)}:${gAmp.toFixed(4)}:${gFreq.toFixed(4)}:${windCoeff.toFixed(4)}`;
  const hmac = await HMAC.generate(payload, secret);

  // A bot-like flat/linear path where coordinates jump/stay constant without matching gravity/wind dynamics
  const pathPoints = [
    { t: 0, y: 100, vy: 0 },
    { t: 16, y: 200, vy: 0 },
    { t: 32, y: 300, vy: 0 },
  ];

  const request = new Request('http://localhost/api/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      challengeId,
      gBase,
      gAmp,
      gFreq,
      windCoeff,
      pathPoints,
      hmac,
    }),
  });

  const mockContext = {
    env: { CAPTCHA_SECRET: secret },
    request,
  };

  const response = await onRequestPost(mockContext);
  expect(response.status).toBe(400);
  const data = await response.json();
  expect(data).toEqual({ success: false, error: 'Physics mismatch' });
});

test('rejects tampered payload with Tampered payload error', async () => {
  const challengeId = crypto.randomUUID();
  const gBase = 9.81;
  const gAmp = 2.0;
  const gFreq = 1.0;
  const windCoeff = 0.1;

  const hmac = 'invalid_hmac_signature';
  const pathPoints = generateValidPath(gBase, gAmp, gFreq, windCoeff);

  const request = new Request('http://localhost/api/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      challengeId,
      gBase,
      gAmp,
      gFreq,
      windCoeff,
      pathPoints,
      hmac,
    }),
  });

  const mockContext = {
    env: { CAPTCHA_SECRET: secret },
    request,
  };

  const response = await onRequestPost(mockContext);
  expect(response.status).toBe(400);
  const data = await response.json();
  expect(data).toEqual({ success: false, error: 'Tampered payload' });
});
