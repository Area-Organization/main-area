import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Page from '../../src/routes/+page.svelte';

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a list of areas when data loads', async () => {
    const mockPageData = {
      areas: {
        areas: [
          {
            id: '1',
            name: 'My Cool Area',
            description: 'Syncs GitHub to Discord',
            enabled: true,
            triggerCount: 5,
            lastTriggered: null,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            action: { serviceName: 'github', actionName: 'push' },
            reactions: [{ serviceName: 'discord', reactionName: 'msg' }]
          }
        ],
        total: 1,
        limit: 20,
        offset: 0
      }
    };

    render(Page, { data: mockPageData });

    expect(screen.getByText('My Cool Area')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Syncs GitHub to Discord')).toBeInTheDocument();
    expect(screen.getByText('github')).toBeInTheDocument();
  });

  it('renders empty state when no areas exist', async () => {
    const mockEmptyData = {
      areas: {
        areas: [],
        total: 0,
        limit: 20,
        offset: 0
      }
    };

    render(Page, { data: mockEmptyData });

    expect(screen.getByText("You haven't created any areas yet")).toBeInTheDocument();
    const createBtn = screen.getByRole('link', { name: /Create Your First AREA/i });
    expect(createBtn).toBeInTheDocument();
    expect(createBtn.getAttribute('href')).toBe('/create');
  });
});
