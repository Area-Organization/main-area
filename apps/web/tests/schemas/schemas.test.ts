import { describe, it, expect } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import { loginSchema, registrationSchema } from '$lib/schemas/auth.schemas';
import { createAreaSchema } from '$lib/schemas/area.schemas';

describe('Auth Schemas', () => {
  describe('Login Schema', () => {
    it('validates correct email and password', () => {
      const valid = { email: 'test@example.com', password: 'password123' };
      expect(Value.Check(loginSchema, valid)).toBe(true);
    });

    it('rejects invalid email format', () => {
      const invalid = { email: 'not-an-email', password: 'password123' };
      expect(Value.Check(loginSchema, invalid)).toBe(false);
    });

    it('rejects short password', () => {
      const invalid = { email: 'test@example.com', password: 'short' };
      expect(Value.Check(loginSchema, invalid)).toBe(false);
    });
  });

  describe('Registration Schema', () => {
    it('requires all fields', () => {
      const valid = {
        name: 'User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };
      expect(Value.Check(registrationSchema, valid)).toBe(true);
    });
  });
});

describe('Area Schemas', () => {
  it('validates a complete area structure', () => {
    const validArea = {
      name: 'My Automation',
      description: 'Test description',
      action: {
        serviceName: 'github',
        actionName: 'new_issue',
        params: { repo: 'test' }
      },
      reactions: [
        {
          serviceName: 'discord',
          reactionName: 'send_message',
          params: { channel: '123' }
        }
      ]
    };
    expect(Value.Check(createAreaSchema, validArea)).toBe(true);
  });

  it('rejects empty name', () => {
    const invalidArea = {
      name: '',
      action: { serviceName: 'a', actionName: 'b', params: {} },
      reactions: []
    };
    expect(Value.Check(createAreaSchema, invalidArea)).toBe(false);
  });
});
