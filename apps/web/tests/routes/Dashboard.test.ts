import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Page from '../../src/routes/+page.svelte';

// Mock the API calls
const mockGetAreas = vi.fn();

vi.mock('$lib/api/getAreas', () => ({
  getAreas: (...args: any[]) => mockGetAreas(...args)
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Return a promise that never resolves immediately
    mockGetAreas.mockReturnValue(new Promise(() => {}));
    render(Page);
    expect(screen.getByText('Loading your areas...')).toBeInTheDocument();
  });

  it('renders a list of areas when data loads', async () => {
    const mockData = {
      areas: [
        {
          id: '1',
          name: 'My Cool Area',
          description: 'Syncs GitHub to Discord',
          enabled: true,
          triggerCount: 5,
          action: { serviceName: 'github', actionName: 'push' },
          reaction: { serviceName: 'discord', reactionName: 'msg' }
        }
      ],
      total: 1
    };

    mockGetAreas.mockResolvedValue(mockData);

    render(Page);

    await waitFor(() => {
      expect(screen.getByText('My Cool Area')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Syncs GitHub to Discord')).toBeInTheDocument();
    });
  });

  it('renders empty state when no areas exist', async () => {
    mockGetAreas.mockResolvedValue({ areas: [], total: 0 });

    render(Page);

    await waitFor(() => {
      expect(screen.getByText("You haven't created any areas yet")).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Create Your First AREA/i })).toBeInTheDocument();
    });
  });

  it('refetches areas when toggle button is clicked', async () => {
     const mockData = {
      areas: [
        { id: '1', name: 'Area 1', enabled: true, action: {}, reaction: {} }
      ],
      total: 1
    };
    mockGetAreas.mockResolvedValue(mockData);

    render(Page);

    await waitFor(() => screen.getByText('Area 1'));

    const toggleBtn = screen.getByText('Disable');
    await fireEvent.click(toggleBtn);

    // The component calls getAreas again on toggle
    expect(mockGetAreas).toHaveBeenCalledTimes(2);
  });
});
