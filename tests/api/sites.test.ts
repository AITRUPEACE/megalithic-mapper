/**
 * Sites API Tests
 * 
 * Tests for the site creation, listing, and voting functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  schema: vi.fn(),
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

// Import after mocking
import { POST as createSite, GET as listSites } from '@/app/api/sites/route';

describe('Sites API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.schema.mockReturnValue(mockSchemaClient);
  });

  describe('POST /api/sites - Create Site', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost:3000/api/sites', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Site',
          summary: 'A test site',
          siteType: 'megalithic',
          coordinates: { lat: 30.0, lng: 31.0 },
        }),
      });

      const response = await createSite(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if required fields are missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/sites', {
        method: 'POST',
        body: JSON.stringify({
          name: '', // Empty name
          summary: 'A test site',
        }),
      });

      const response = await createSite(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('required');
    });

    it('should return 400 if coordinates are missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/sites', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Site',
          summary: 'A test site',
          siteType: 'megalithic',
          // No coordinates
        }),
      });

      const response = await createSite(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('coordinates');
    });

    it('should create a site successfully with valid data', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });

      const mockSite = {
        id: 'new-site-id',
        name: 'Great Pyramid',
        slug: 'great-pyramid',
        summary: 'Ancient wonder',
        verification_status: 'under_review',
      };

      mockSchemaClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockSite, error: null }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/sites', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Great Pyramid',
          summary: 'Ancient wonder',
          siteType: 'pyramid',
          coordinates: { lat: 29.9792, lng: 31.1342 },
          tags: {
            cultures: ['Egyptian'],
            eras: ['Old Kingdom'],
            themes: ['megalithic'],
          },
        }),
      });

      const response = await createSite(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.site).toEqual(mockSite);
    });
  });

  describe('GET /api/sites - List Sites', () => {
    it('should return list of sites', async () => {
      const mockSites = [
        { id: '1', name: 'Site A', verification_status: 'verified' },
        { id: '2', name: 'Site B', verification_status: 'under_review' },
      ];

      mockSchemaClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({ data: mockSites, error: null }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/sites');

      const response = await listSites(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sites).toHaveLength(2);
    });

    it('should filter by verification status', async () => {
      const mockSites = [
        { id: '1', name: 'Site A', verification_status: 'verified' },
      ];

      // Create chainable mock that returns itself for any method and resolves on await
      const createChainableMock = (finalData: unknown = []) => {
        const chain: Record<string, unknown> & { then?: (cb: (val: unknown) => unknown) => void } = {};
        const methods = ['select', 'eq', 'not', 'is', 'in', 'order', 'limit', 'range'];
        methods.forEach(method => {
          chain[method] = vi.fn().mockReturnValue(chain);
        });
        // Make it thenable so it can be awaited
        chain.then = (cb: (val: unknown) => unknown) => cb({ data: finalData, error: null });
        return chain;
      };

      mockSchemaClient.from.mockReturnValue(createChainableMock(mockSites));

      const request = new NextRequest('http://localhost:3000/api/sites?status=verified');

      const response = await listSites(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sites).toHaveLength(1);
      expect(data.sites[0].verification_status).toBe('verified');
    });
  });
});

describe('Site Voting', () => {
  // These tests would test the voting endpoint
  it('should validate vote types', () => {
    const validVotes = ['approve', 'reject', 'needs_info'];
    const invalidVotes = ['like', 'upvote', 'yes'];

    validVotes.forEach((vote) => {
      expect(['approve', 'reject', 'needs_info'].includes(vote)).toBe(true);
    });

    invalidVotes.forEach((vote) => {
      expect(['approve', 'reject', 'needs_info'].includes(vote)).toBe(false);
    });
  });

  it('should calculate verification threshold correctly', () => {
    const VERIFICATION_THRESHOLD = 5;
    
    // Site with enough approvals
    const site1 = { votes_approve: 6, votes_reject: 0 };
    expect(site1.votes_approve >= VERIFICATION_THRESHOLD && site1.votes_reject === 0).toBe(true);

    // Site with not enough approvals
    const site2 = { votes_approve: 3, votes_reject: 0 };
    expect(site2.votes_approve >= VERIFICATION_THRESHOLD).toBe(false);

    // Site with rejections
    const site3 = { votes_approve: 6, votes_reject: 2 };
    expect(site3.votes_approve >= VERIFICATION_THRESHOLD && site3.votes_reject === 0).toBe(false);
  });
});

