/**
 * Type exports for Megalithic Mapper
 */

// Database types (auto-generated from Supabase)
export type { Database, Json } from './database.types';

// Social features types
export * from './social.types';

// Re-export common types from profile for convenience
export type { 
  ProfileRecord, 
  PublicProfile, 
  PublicBadge,
  MapViewport,
  OnboardingValues 
} from '@/lib/supabase/profile';











