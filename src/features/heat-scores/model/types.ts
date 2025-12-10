/**
 * Heat Score System Types
 * 
 * Heat tiers indicate site popularity/activity:
 * - hot: Top 5% - highest engagement, pulsing glow effect
 * - rising: Top 15% - increasing activity, subtle pulse
 * - active: Top 30% - regular activity, slightly larger marker
 * - normal: Default state
 * - low: Below average activity, muted marker
 */

export type HeatTier = 'hot' | 'rising' | 'active' | 'normal' | 'low';

export interface SiteHeatScore {
  siteId: string;
  siteName: string;
  heatScore: number; // 0-100 normalized score
  heatTier: HeatTier;
  lastCalculated: Date;
  factors: HeatFactors;
  // For "What's Hot" display
  trendReason?: string; // e.g., "12 new photos added", "Expert discussion ongoing"
}

export interface HeatFactors {
  recentPosts: number;      // Posts in last 7 days
  recentMedia: number;      // Media uploads in last 7 days
  voteVelocity: number;     // Votes per day (rolling 7-day average)
  visitorCount: number;     // Unique visitors in last 7 days
  commentCount: number;     // Comments in last 7 days
}

// Weight configuration for heat score calculation
export const HEAT_WEIGHTS = {
  recentPosts: 0.25,      // 25% weight
  recentMedia: 0.20,      // 20% weight
  voteVelocity: 0.25,     // 25% weight
  visitorCount: 0.15,     // 15% weight
  commentCount: 0.15,     // 15% weight
} as const;

// Percentile thresholds for heat tiers
export const HEAT_THRESHOLDS = {
  hot: 95,      // Top 5%
  rising: 85,   // Top 15%
  active: 70,   // Top 30%
  normal: 30,   // Above 30%
  // Below 30% = low
} as const;

/**
 * Calculate heat score from factors
 */
export function calculateHeatScore(factors: HeatFactors): number {
  // Normalize each factor to 0-100 scale
  // These max values are calibrated based on expected activity levels
  const normalized = {
    recentPosts: Math.min(100, (factors.recentPosts / 20) * 100),
    recentMedia: Math.min(100, (factors.recentMedia / 50) * 100),
    voteVelocity: Math.min(100, (factors.voteVelocity / 10) * 100),
    visitorCount: Math.min(100, (factors.visitorCount / 500) * 100),
    commentCount: Math.min(100, (factors.commentCount / 30) * 100),
  };

  // Calculate weighted score
  const score = 
    normalized.recentPosts * HEAT_WEIGHTS.recentPosts +
    normalized.recentMedia * HEAT_WEIGHTS.recentMedia +
    normalized.voteVelocity * HEAT_WEIGHTS.voteVelocity +
    normalized.visitorCount * HEAT_WEIGHTS.visitorCount +
    normalized.commentCount * HEAT_WEIGHTS.commentCount;

  return Math.round(score);
}

/**
 * Determine heat tier from percentile rank
 */
export function getHeatTier(percentileRank: number): HeatTier {
  if (percentileRank >= HEAT_THRESHOLDS.hot) return 'hot';
  if (percentileRank >= HEAT_THRESHOLDS.rising) return 'rising';
  if (percentileRank >= HEAT_THRESHOLDS.active) return 'active';
  if (percentileRank >= HEAT_THRESHOLDS.normal) return 'normal';
  return 'low';
}

/**
 * Generate trend reason from factors
 */
export function getTrendReason(factors: HeatFactors): string {
  const reasons: string[] = [];
  
  if (factors.recentMedia >= 10) {
    reasons.push(`${factors.recentMedia} new photos`);
  }
  if (factors.recentPosts >= 5) {
    reasons.push(`${factors.recentPosts} new posts`);
  }
  if (factors.commentCount >= 20) {
    reasons.push('Active discussion');
  }
  if (factors.voteVelocity >= 5) {
    reasons.push('Trending votes');
  }
  
  return reasons.slice(0, 2).join(' • ') || 'Recent activity';
}

