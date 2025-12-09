/**
 * Posts API Tests
 * 
 * Tests for post creation and listing functionality.
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

// Import after mocking
import { POST as createPost, GET as listPosts } from '@/app/api/posts/route';

describe('Posts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.schema.mockReturnValue(mockSchemaClient);
  });

  describe('POST /api/posts - Create Post', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          body: 'Test post content',
        }),
      });

      const response = await createPost(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if body is empty', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          body: '', // Empty body
        }),
      });

      const response = await createPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('required');
    });

    it('should create a post successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });

      const mockPost = {
        id: 'new-post-id',
        title: 'New Research',
        body: 'Exciting findings...',
        author_id: 'test-user-id',
      };

      mockSchemaClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockPost, error: null }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Research',
          body: 'Exciting findings about ancient structures...',
          postType: 'research',
        }),
      });

      const response = await createPost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.post).toEqual(mockPost);
    });

    it('should handle posts linked to sites', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      });

      const mockPost = {
        id: 'new-post-id',
        title: 'Site Update',
        target_type: 'site',
        target_id: 'site-123',
      };

      mockSchemaClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockPost, error: null }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Site Update',
          body: 'New photos added',
          siteId: 'site-123', // Link to site
        }),
      });

      const response = await createPost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.post.target_type).toBe('site');
      expect(data.post.target_id).toBe('site-123');
    });
  });

  describe('GET /api/posts - List Posts', () => {
    it('should return list of public posts', async () => {
      const mockPosts = [
        { id: '1', title: 'Post A', visibility: 'public' },
        { id: '2', title: 'Post B', visibility: 'public' },
      ];

      const mockProfiles = [
        { id: 'user-1', username: 'alice' },
        { id: 'user-2', username: 'bob' },
      ];

      mockSchemaClient.from.mockImplementation((table: string) => {
        if (table === 'posts') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  is: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      range: vi.fn().mockResolvedValue({ data: mockPosts, error: null }),
                    }),
                  }),
                }),
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

      const request = new NextRequest('http://localhost:3000/api/posts');

      const response = await listPosts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.posts).toBeDefined();
    });
  });
});

describe('YouTube URL Parsing', () => {
  // Helper function (same as in the API)
  function parseYouTubeUrl(url: string): { videoId: string; thumbnail: string } | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const videoId = match[1];
        return {
          videoId,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        };
      }
    }
    return null;
  }

  it('should parse standard YouTube URLs', () => {
    const result = parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result).not.toBeNull();
    expect(result?.videoId).toBe('dQw4w9WgXcQ');
    expect(result?.thumbnail).toContain('dQw4w9WgXcQ');
  });

  it('should parse short YouTube URLs', () => {
    const result = parseYouTubeUrl('https://youtu.be/dQw4w9WgXcQ');
    expect(result).not.toBeNull();
    expect(result?.videoId).toBe('dQw4w9WgXcQ');
  });

  it('should parse YouTube embed URLs', () => {
    const result = parseYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
    expect(result).not.toBeNull();
    expect(result?.videoId).toBe('dQw4w9WgXcQ');
  });

  it('should parse YouTube Shorts URLs', () => {
    const result = parseYouTubeUrl('https://www.youtube.com/shorts/abc123DEF45');
    expect(result).not.toBeNull();
    expect(result?.videoId).toBe('abc123DEF45');
  });

  it('should return null for non-YouTube URLs', () => {
    const result = parseYouTubeUrl('https://vimeo.com/123456');
    expect(result).toBeNull();
  });

  it('should return null for invalid URLs', () => {
    const result = parseYouTubeUrl('not a url');
    expect(result).toBeNull();
  });
});



