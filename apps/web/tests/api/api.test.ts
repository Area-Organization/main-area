import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAreas } from '$lib/api/getAreas';
import { getServices } from '$lib/api/getServices';

const mockGet = vi.fn();

vi.mock('$lib/api', () => ({
  client: {
    api: {
      areas: {
        get: (...args: any[]) => mockGet('areas', ...args)
      },
      connections: {
        get: (...args: any[]) => mockGet('connections', ...args)
      }
    },
    'about.json': {
      get: (...args: any[]) => mockGet('about', ...args)
    }
  }
}));

describe('API Wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAreas', () => {
    it('fetches areas successfully', async () => {
      const mockData = { areas: [], total: 0 };
      mockGet.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await getAreas({ limit: 10 });
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      mockGet.mockResolvedValueOnce({ data: null, error: { status: 500 } });
      await expect(getAreas()).rejects.toThrow('Failed to fetch areas: 500');
    });
  });

  describe('getServices', () => {
    it('extracts services from about.json structure', async () => {
      const mockServices = [{ name: 'github' }];
      mockGet.mockResolvedValueOnce({
        data: { server: { services: mockServices } },
        error: null
      });

      const result = await getServices();
      expect(result).toEqual(mockServices);
    });

    it('returns empty array if services are missing', async () => {
      mockGet.mockResolvedValueOnce({
        data: { server: {} },
        error: null
      });

      const result = await getServices();
      expect(result).toEqual([]);
    });
  });
});
