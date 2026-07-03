import { HMAC } from '../../../src/crypto';

export async function onRequestPost(context: any) {
  const body = await context.request.json();
  const { challengeId, gBase, gAmp, gFreq, windCoeff, pathPoints, hmac } = body;

  // Verify HMAC first
  const secret = context.env.CAPTCHA_SECRET || 'fallback_secret';
  const payload = `${challengeId}:${Number(gBase).toFixed(4)}:${Number(gAmp).toFixed(4)}:${Number(gFreq).toFixed(4)}:${Number(windCoeff).toFixed(4)}`;
  const expectedHmac = await HMAC.generate(payload, secret);

  if (hmac !== expectedHmac) {
    return new Response(JSON.stringify({ success: false, error: 'Tampered payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Iterate through points and integrate velocity/position
  let valid = true;
  for (let i = 1; i < pathPoints.length; i++) {
    const p0 = pathPoints[i - 1];
    const p1 = pathPoints[i];
    const dt = (p1.t - p0.t) / 1000.0; // convert ms to s

    if (dt <= 0 || dt > 1.0) {
      valid = false;
      break;
    }

    // Physics model validation: v_y(t)
    const currentGravity = Number(gBase) + Number(gAmp) * Math.sin(Number(gFreq) * (p0.t / 1000.0));
    const simulatedVy = (p1.y - p0.y) / dt;
    const expectedVy = p0.vy + (currentGravity - Number(windCoeff) * p0.vy) * dt;

    // Allow a small threshold for floating-point calculation errors
    if (Math.abs(simulatedVy - expectedVy) > 50) {
      valid = false;
      break;
    }
  }

  if (!valid) {
    return new Response(JSON.stringify({ success: false, error: 'Physics mismatch' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
