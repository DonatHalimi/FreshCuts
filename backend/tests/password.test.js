import { describe, expect, it } from 'vitest';
import { hashPassword, comparePassword } from '../src/auth/password.js';

describe('password hashing', () => {
  it('hashes and verifies the original password', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    expect(hash).not.toBe('correct-horse-battery-staple');
    await expect(comparePassword('correct-horse-battery-staple', hash)).resolves.toBe(true);
    await expect(comparePassword('wrong-password', hash)).resolves.toBe(false);
  });
});