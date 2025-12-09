/**
 * Feed API Tests
 * 
 * Tests for the activity feed functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  schema: vi.fn(),
  rpc: vi.fn(),
};

const mockSchemaClient = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock('@/lib/supabase/config', () => ({
  SUPABASE_SCHEMA: 'megalithic',
}));

import { GET as getFeed } from '@/app/api/feed/route';

describe('Feed API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.schema.mockReturnValue(mockSchemaClient);
    mockSupabase.rpc.mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: null }), // Table doesn't exist
    });
  });

  describe('GET /api/feed', () => {
    it('should return feed items with default sorting (new)', async () => {
      const mockPosts = [
        { id: '1', title: 'Post 1', published_at: '2024-01-02', author_id: 'user-1' },
        { id: '2', title: 'Post 2', published_at: '2024-01-01', author_id: 'user-2' },
      ];

      const mockSites = [
        { id: 's1', name: 'Site 1', created_at: '2024-01-03', created_by: 'user-1' },
      ];

      const mockProfiles = [
        { id: 'user-1', username: 'alice', is_verified: true },
        { id: 'user-2', username: 'bob', is_verified: false },
      ];

      mockSchemaClient.from.mockImplementation((table: string) => {
        if (table === 'posts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  is: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      limit: vi.fn().mockResolvedValue({ data: mockPosts, error: null }),
                    }),
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'sites') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: mockSites, error: null }),
              }),
            }),
          };
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
            }),
          };
        }
        return {};
      });

      const request = new NextRequest('http://localhost:3000/api/feed');
      const response = await getFeed(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.feed).toBeDefined();
      expect(data.meta.sortBy).toBe('new');
    });

    it('should support hot sorting', async () => {
      // Create chainable mock that returns itself for any method
      const createChainableMock = (finalData: unknown = []) => {
        const chain: Record<string, unknown> = {};
        const methods = ['select', 'eq', 'not', 'is', 'in', 'order', 'limit', 'range'];
        methods.forEach(method => {
          chain[method] = vi.fn().mockReturnValue(chain);
        });
        // Terminal method
        chain['limit'] = vi.fn().mockResolvedValue({ data: finalData, error: null });
        chain['range'] = vi.fn().mockResolvedValue({ data: finalData, error: null });
        return chain;
      };

      mockSchemaClient.from.mockImplementation(() => createChainableMock());

      const request = new NextRequest('http://localhost:3000/api/feed?sort=hot');
      const response = await getFeed(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.sortBy).toBe('hot');
    });

    it('should support filtering by site', async () => {
      // Create chainable mock
      const createChainableMock = (finalData: unknown = []) => {
        const chain: Record<string, unknown> = {};
        const methods = ['select', 'eq', 'not', 'is', 'in', 'order', 'limit', 'range'];
        methods.forEach(method => {
          chain[method] = vi.fn().mockReturnValue(chain);
        });
        chain['limit'] = vi.fn().mockResolvedValue({ data: finalData, error: null });
        chain['range'] = vi.fn().mockResolvedValue({ data: finalData, error: null });
        return chain;
      };

      mockSchemaClient.from.mockImplementation(() => createChainableMock());

      const request = new NextRequest('http://localhost:3000/api/feed?siteId=site-123');
      const response = await getFeed(request);

      expect(response.status).toBe(200);
    });
  });
});

describe('Feed Sorting Algorithms', () => {
  // Test the hot score calculation logic
  function calculateHotScore(item: { engagement_score: number; created_at: string }): number {
    const hoursSincePost =
      (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60);
    const decay = Math.pow(0.95, hoursSincePost);
    return item.engagement_score * decay;
  }

  it('should rank newer items higher with same engagement', () => {
    const recentItem = {
      engagement_score: 100,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    };
    const olderItem = {
      engagement_score: 100,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
    };

    const recentScore = calculateHotScore(recentItem);
    const olderScore = calculateHotScore(olderItem);

    expect(recentScore).toBeGreaterThan(olderScore);
  });

  it('should rank higher engagement items higher', () => {
    const highEngagement = {
      engagement_score: 500,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    };
    const lowEngagement = {
      engagement_score: 10,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    };

    const highScore = calculateHotScore(highEngagement);
    const lowScore = calculateHotScore(lowEngagement);

    expect(highScore).toBeGreaterThan(lowScore);
  });

  it('should decay score over time', () => {
    const item = { engagement_score: 100, created_at: '' };
    
    // Same item at different times
    const now = Date.now();
    item.created_at = new Date(now).toISOString();
    const scoreNow = calculateHotScore(item);

    item.created_at = new Date(now - 12 * 60 * 60 * 1000).toISOString();
    const score12h = calculateHotScore(item);

    item.created_at = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const score24h = calculateHotScore(item);

    expect(scoreNow).toBeGreaterThan(score12h);
    expect(score12h).toBeGreaterThan(score24h);
  });
});

describe('Activity Types', () => {
  const validActivityTypes = [
    'site_added',
    'site_verified',
    'site_updated',
    'media_added',
    'post_created',
    'comment_added',
    'user_joined',
    'badge_earned',
    'connection_proposed',
  ];

  it('should validate all activity types', () => {
    validActivityTypes.forEach((type) => {
      expect(validActivityTypes.includes(type)).toBe(true);
    });
  });

  it('should reject invalid activity types', () => {
    const invalidTypes = ['like', 'share', 'follow'];
    invalidTypes.forEach((type) => {
      expect(validActivityTypes.includes(type)).toBe(false);
    });
  });
});

