import { describe, it, expect } from 'vitest';
import { cn } from '$lib/utils';

describe('Utils: cn (Classname Merge)', () => {
  it('merges tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'p-4');
    expect(result).toBe('p-4');
  });

  it('handles conditional classes', () => {
    const result = cn('text-red-500', true && 'bg-blue-500', false && 'hidden');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('handles undefined and null values', () => {
    const result = cn('flex', undefined, null, 'gap-2');
    expect(result).toBe('flex gap-2');
  });
});
