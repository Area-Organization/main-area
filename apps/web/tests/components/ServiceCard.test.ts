import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import ServiceCard from '$lib/components/ServiceCard.svelte';

// Mock the API call used in onMount
vi.mock('$lib/api/getServiceAuthUrl', () => ({
  getServiceAuthUrl: vi.fn().mockResolvedValue({ authUrl: 'http://mock-auth' })
}));

describe('ServiceCard', () => {
  const mockService = {
    name: 'github',
    description: 'GitHub Service',
    requiresAuth: true,
    authType: 'oauth2',
    actions: [],
    reactions: []
  };

  it('shows as connected (Switch checked) when connection exists', async () => {
    const connections = [{
      id: '123',
      serviceName: 'github',
      createdAt: new Date(),
      updatedAt: new Date()
    }];

    render(ServiceCard, { service: mockService, connections });

    await waitFor(() => {
      const switchEl = screen.getByRole('switch');
      expect(switchEl.getAttribute('aria-checked')).toBe('true');
    });
  });

  it('renders auth link when not connected', async () => {
    render(ServiceCard, { service: mockService, connections: [] });

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /github connection/i });
      expect(link).toHaveAttribute('href', 'http://mock-auth');
    });
  });
});
