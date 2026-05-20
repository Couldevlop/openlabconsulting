import { describe, it, expect } from 'vitest';
import { currentTotp, generateTotpSetup, verifyTotp } from '@/lib/totp';

describe('lib/totp', () => {
  it('generateTotpSetup renvoie un secret base32 + otpauth URL + QR data URL', async () => {
    const setup = await generateTotpSetup('debora@openlabconsulting.com');
    expect(setup.secret).toMatch(/^[A-Z2-7]+$/); // base32
    expect(setup.secret.length).toBeGreaterThanOrEqual(16);
    expect(setup.otpauthUrl).toMatch(/^otpauth:\/\/totp\//);
    expect(setup.otpauthUrl).toContain('OpenLab%20Consulting%20Admin');
    expect(setup.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('verifyTotp accepte un code généré par currentTotp', async () => {
    const { secret } = await generateTotpSetup('test@example.com');
    const code = currentTotp(secret);
    expect(verifyTotp(code, secret)).toBe(true);
  });

  it('verifyTotp rejette un code incorrect', async () => {
    const { secret } = await generateTotpSetup('test@example.com');
    expect(verifyTotp('000000', secret)).toBe(false);
  });

  it('verifyTotp rejette un code non-6-chiffres', async () => {
    const { secret } = await generateTotpSetup('test@example.com');
    expect(verifyTotp('abc123', secret)).toBe(false);
    expect(verifyTotp('12345', secret)).toBe(false);
    expect(verifyTotp('', secret)).toBe(false);
  });

  it('verifyTotp rejette un secret vide', () => {
    expect(verifyTotp('123456', '')).toBe(false);
  });
});
