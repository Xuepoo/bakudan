import { HMAC } from '../../../src/crypto';

export async function onRequest(context: any) {
  const secret = context.env.CAPTCHA_SECRET || 'fallback_secret';
  const challengeId = crypto.randomUUID();

  // Generate randomized gravity baseline (8.5 to 11.5) and amplitude (1.0 to 3.0)
  const gBase = 8.5 + Math.random() * 3.0;
  const gAmp = 1.0 + Math.random() * 2.0;
  const gFreq = 0.5 + Math.random() * 1.5;
  const windCoeff = 0.05 + Math.random() * 0.15;

  // Generate signature payload
  const payload = `${challengeId}:${gBase.toFixed(4)}:${gAmp.toFixed(4)}:${gFreq.toFixed(4)}:${windCoeff.toFixed(4)}`;
  const hmac = await HMAC.generate(payload, secret);

  return new Response(
    JSON.stringify({
      challengeId,
      gBase,
      gAmp,
      gFreq,
      windCoeff,
      hmac,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
