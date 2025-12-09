/**
 * Site Voting API Tests
 * 
 * Tests for the community voting and verification system.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase
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

import { POST as voteOnSite, GET as getVotes, DELETE as removeVote } from '@/app/api/sites/[id]/vote/route';

describe('Site Voting API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.schema.mockReturnValue(mockSchemaClient);
  });

  describe('POST /api/sites/[id]/vote', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost:3000/api/sites/site-123/vote', {
        method: 'POST',
        body: JSON.stringify({ voteType: 'approve' }),
      });

      const response = await voteOnSite(request, { params: Promise.resolve({ id: 'site-123' }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 for invalid vote type', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/sites/site-123/vote', {
        method: 'POST',
        body: JSON.stringify({ voteType: 'upvote' }), // Invalid type
      });

      const response = await voteOnSite(request, { params: Promise.resolve({ id: 'site-123' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid vote type');
    });

    it('should return 404 if site does not exist', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      mockSchemaClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/sites/nonexistent/vote', {
        method: 'POST',
        body: JSON.stringify({ voteType: 'approve' }),
      });

      const response = await voteOnSite(request, { params: Promise.resolve({ id: 'nonexistent' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Site not found');
    });

    it('should create a new vote successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });

      // Site exists
      mockSchemaClient.from.mockImplementation((table: string) => {
        if (table === 'sites') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'site-123', name: 'Test Site', verification_status: 'under_review' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'site_votes') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: null }), // No existing vote
                }),
              }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const request = new NextRequest('http://localhost:3000/api/sites/site-123/vote', {
        method: 'POST',
        body: JSON.stringify({ voteType: 'approve', reason: 'Looks legitimate' }),
      });

      const response = await voteOnSite(request, { params: Promise.resolve({ id: 'site-123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.vote).toBe('approve');
    });

    it('should update existing vote', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });

      mockSchemaClient.from.mockImplementation((table: string) => {
        if (table === 'sites') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'site-123', name: 'Test Site' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'site_votes') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'vote-1', vote_type: 'approve' }, // Existing vote
                    error: null,
                  }),
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return {};
      });

      const request = new NextRequest('http://localhost:3000/api/sites/site-123/vote', {
        method: 'POST',
        body: JSON.stringify({ voteType: 'reject' }), // Change vote
      });

      const response = await voteOnSite(request, { params: Promise.resolve({ id: 'site-123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Vote updated');
      expect(data.previousVote).toBe('approve');
      expect(data.newVote).toBe('reject');
    });
  });

  describe('GET /api/sites/[id]/vote', () => {
    it('should return vote counts', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      mockSchemaClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                votes_approve: 5,
                votes_reject: 1,
                votes_needs_info: 2,
                verification_status: 'under_review',
              },
              error: null,
            }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/sites/site-123/vote');
      const response = await getVotes(request, { params: Promise.resolve({ id: 'site-123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.votes.approve).toBe(5);
      expect(data.votes.reject).toBe(1);
      expect(data.votes.needs_info).toBe(2);
    });

    it('should include user vote if authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      mockSchemaClient.from.mockImplementation((table: string) => {
        if (table === 'sites') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { votes_approve: 5, votes_reject: 1, votes_needs_info: 2, verification_status: 'under_review' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'site_votes') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { vote_type: 'approve' },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const request = new NextRequest('http://localhost:3000/api/sites/site-123/vote');
      const response = await getVotes(request, { params: Promise.resolve({ id: 'site-123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.userVote).toBe('approve');
    });
  });

  describe('DELETE /api/sites/[id]/vote', () => {
    it('should remove user vote', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      mockSchemaClient.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/sites/site-123/vote', {
        method: 'DELETE',
      });

      const response = await removeVote(request, { params: Promise.resolve({ id: 'site-123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Vote removed');
    });
  });
});

describe('Auto-Verification Logic', () => {
  const VERIFICATION_THRESHOLD = 5;

  interface SiteVotes {
    votes_approve: number;
    votes_reject: number;
    votes_needs_info: number;
    verification_status: string;
  }

  function shouldAutoVerify(site: SiteVotes): boolean {
    return (
      site.votes_approve >= VERIFICATION_THRESHOLD &&
      site.votes_reject === 0 &&
      site.verification_status === 'under_review'
    );
  }

  it('should verify site with enough approvals and no rejections', () => {
    const site: SiteVotes = {
      votes_approve: 5,
      votes_reject: 0,
      votes_needs_info: 0,
      verification_status: 'under_review',
    };
    expect(shouldAutoVerify(site)).toBe(true);
  });

  it('should not verify site with rejections', () => {
    const site: SiteVotes = {
      votes_approve: 10,
      votes_reject: 1,
      votes_needs_info: 0,
      verification_status: 'under_review',
    };
    expect(shouldAutoVerify(site)).toBe(false);
  });

  it('should not verify site with insufficient approvals', () => {
    const site: SiteVotes = {
      votes_approve: 4,
      votes_reject: 0,
      votes_needs_info: 0,
      verification_status: 'under_review',
    };
    expect(shouldAutoVerify(site)).toBe(false);
  });

  it('should not re-verify already verified site', () => {
    const site: SiteVotes = {
      votes_approve: 10,
      votes_reject: 0,
      votes_needs_info: 0,
      verification_status: 'verified', // Already verified
    };
    expect(shouldAutoVerify(site)).toBe(false);
  });
});



