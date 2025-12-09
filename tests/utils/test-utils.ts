/**
 * Test Utilities
 * 
 * Shared utilities for testing the MVP features.
 */

import { vi } from 'vitest';

/**
 * Create a chainable mock that mimics Supabase query builder.
 * Returns itself for any method call and resolves with provided data.
 */
export function createChainableMock<T>(finalData: T | T[] = [] as T[]) {
  type ChainType = Record<string, ReturnType<typeof vi.fn>> & {
    then?: (cb: (val: { data: T | T[]; error: null }) => unknown) => void;
  };

  const chain: ChainType = {};
  const methods = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
    'not', 'is', 'in', 'contains',
    'or', 'and', 'filter',
    'order', 'limit', 'range', 'single', 'maybeSingle',
  ];

  methods.forEach(method => {
    chain[method] = vi.fn().mockReturnValue(chain);
  });

  // Make it thenable for await support
  chain.then = (cb) => cb({ data: finalData, error: null });

  return chain;
}

/**
 * Create a mock Supabase client
 */
export function createMockSupabase(options?: {
  user?: { id: string; email: string } | null;
  schemaClient?: ReturnType<typeof createChainableMock>;
}) {
  const user = options?.user ?? { id: 'test-user-id', email: 'test@example.com' };
  const schemaClient = options?.schemaClient ?? createChainableMock();

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'Not authenticated' },
      }),
    },
    schema: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue(schemaClient),
    }),
    rpc: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: null }),
    }),
  };
}

/**
 * Generate a mock site object
 */
export function mockSite(overrides: Partial<MockSite> = {}): MockSite {
  return {
    id: 'test-site-id',
    slug: 'test-site',
    name: 'Test Site',
    summary: 'A test megalithic site',
    site_type: 'megalithic',
    category: 'monument',
    coordinates: { lat: 29.9792, lng: 31.1342 },
    verification_status: 'under_review',
    layer: 'sites',
    trust_tier: 1,
    votes_approve: 0,
    votes_reject: 0,
    votes_needs_info: 0,
    created_at: new Date().toISOString(),
    created_by: 'test-user-id',
    ...overrides,
  };
}

export interface MockSite {
  id: string;
  slug: string;
  name: string;
  summary: string;
  site_type: string;
  category: string;
  coordinates: { lat: number; lng: number };
  verification_status: 'under_review' | 'verified' | 'rejected' | 'needs_revision';
  layer: string;
  trust_tier: number;
  votes_approve: number;
  votes_reject: number;
  votes_needs_info: number;
  created_at: string;
  created_by: string;
}

/**
 * Generate a mock post object
 */
export function mockPost(overrides: Partial<MockPost> = {}): MockPost {
  return {
    id: 'test-post-id',
    title: 'Test Post',
    body: 'Test post body content',
    post_type: 'research',
    author_id: 'test-user-id',
    visibility: 'public',
    published_at: new Date().toISOString(),
    external_links: [],
    ...overrides,
  };
}

export interface MockPost {
  id: string;
  title: string;
  body: string;
  post_type: string;
  author_id: string;
  visibility: string;
  published_at: string;
  external_links: Array<{ url: string; type: string; title?: string }>;
}

/**
 * Generate a mock profile object
 */
export function mockProfile(overrides: Partial<MockProfile> = {}): MockProfile {
  return {
    id: 'test-user-id',
    username: 'testuser',
    full_name: 'Test User',
    bio: 'A test user',
    avatar_url: null,
    is_verified: false,
    is_contributor: true,
    role_id: 1,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export interface MockProfile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string | null;
  is_verified: boolean;
  is_contributor: boolean;
  role_id: number;
  created_at: string;
}

/**
 * Generate a mock activity feed item
 */
export function mockActivityItem(overrides: Partial<MockActivityItem> = {}): MockActivityItem {
  return {
    id: 'activity-1',
    activity_type: 'site_added',
    actor_id: 'test-user-id',
    target_type: 'site',
    target_id: 'site-1',
    site_id: 'site-1',
    title: 'New site added',
    description: 'A new megalithic site was discovered',
    engagement_score: 10,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export interface MockActivityItem {
  id: string;
  activity_type: string;
  actor_id: string;
  target_type: string;
  target_id: string;
  site_id: string | null;
  title: string;
  description: string;
  engagement_score: number;
  created_at: string;
}



