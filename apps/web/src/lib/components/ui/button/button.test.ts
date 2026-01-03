import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Button from './button.svelte';

describe('Button Component', () => {
    it('applies variant classes', () => {
        render(Button, { variant: 'destructive' });
        const button = screen.getByRole('button');
        expect(button.className).toContain('bg-destructive');
    });

    it('is disabled when disabled prop is passed', () => {
        render(Button, { disabled: true });
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });
});
