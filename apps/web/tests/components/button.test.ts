import { render } from '@testing-library/svelte';
import Button from '../../src/lib/components/ui/button/button.svelte';

describe('Button', () => {
  it('renders as button by default', () => {
    const { getByRole } = render(Button, { children: () => 'Click me' });
    expect(getByRole('button')).toBeInTheDocument();
  });
  it('renders as link if href is set', () => {
    const { getByRole } = render(Button, { href: '/test', children: () => 'Link' });
    expect(getByRole('link')).toBeInTheDocument();
  });
  it('is disabled when disabled prop is set', () => {
    const { getByRole } = render(Button, { disabled: true, children: () => 'Disabled' });
    expect(getByRole('button')).toBeDisabled();
  });
});
