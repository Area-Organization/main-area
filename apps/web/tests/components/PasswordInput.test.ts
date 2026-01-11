import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import PasswordInput from '$lib/components/PasswordInput.svelte';

describe('PasswordInput', () => {
  it('renders as password type by default', () => {
    render(PasswordInput, { value: 'secret' });
    const input = screen.getByDisplayValue('secret');
    expect(input.getAttribute('type')).toBe('password');
  });

  it('toggles visibility when eye icon is clicked', async () => {
    render(PasswordInput, { value: 'secret' });
    const button = screen.getByRole('button');
    const input = screen.getByDisplayValue('secret');

    // Click to show
    await fireEvent.click(button);
    expect(input.getAttribute('type')).toBe('text');

    // Click to hide
    await fireEvent.click(button);
    expect(input.getAttribute('type')).toBe('password');
  });
});
