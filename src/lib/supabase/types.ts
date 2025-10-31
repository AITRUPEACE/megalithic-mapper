export interface Profile {
  id: string
  email?: string | null
  display_name?: string | null
  tagline?: string | null
  location?: string | null
  affiliation?: string | null
  specialties?: string[] | null
  interests?: string[] | null
  bio?: string | null
  website?: string | null
  onboarding_complete?: boolean | null
  needs_verification_review?: boolean | null
  verification_status?: "unverified" | "pending" | "verified" | null
}

export interface VerificationRequest {
  id: string
  user_id: string
  statement: string
  evidence_paths: string[]
  status: "pending" | "approved" | "rejected"
  created_at: string
}
