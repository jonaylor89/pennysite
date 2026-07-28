/**
 * PostHog Event Names and Types
 *
 * Central definition of all analytics events for consistency
 * across client and server tracking.
 */

// Output Quality Events
export const EVENTS = {
  // Generation lifecycle
  GENERATION_STARTED: "generation_started",
  GENERATION_COMPLETED: "generation_completed",
  GENERATION_FAILED: "generation_failed",

  // Output quality metrics
  PAGE_GENERATED: "page_generated",
  PAGE_FIXED: "page_fixed",
  SITE_VALIDATED: "site_validated",

  // User experience metrics
  SESSION_STARTED: "builder_session_started",
  FIRST_GENERATION_COMPLETE: "first_generation_complete",
  REGENERATION_REQUESTED: "regeneration_requested",
  TIME_TO_PUBLISH: "time_to_publish",

  // Perceived quality metrics
  DRAFT_RATED: "draft_rated",
  PROJECT_SAVED: "project_saved",
  PROJECT_CREATED: "project_created",
  PROJECT_PUBLISHED: "project_published",

  // Cost efficiency (already tracked, listed for reference)
  CREDITS_PURCHASED: "credits_purchased",
  CHECKOUT_STARTED: "checkout_started",

  // Auth events
  LOGIN_COMPLETED: "login_completed",
  SIGNUP_STARTED: "signup_started",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

// Event property types for type safety
export type PageGeneratedProperties = {
  project_id?: string;
  filename: string;
  passed_validation: boolean;
  fix_attempts: number;
  has_single_h1: boolean;
  has_ordered_headings: boolean;
  has_cta_above_fold: boolean;
  palette_consistency_percent: number;
};

export type SiteValidatedProperties = {
  project_id?: string;
  overall_quality: "excellent" | "good" | "needs_improvement";
  total_pages: number;
  pages_needing_fixes: number;
  avg_palette_consistency: number;
  structure_quality_percent: number;
  cta_clarity_percent: number;
};

export type GenerationCompletedProperties = {
  project_id?: string;
  input_tokens?: number;
  output_tokens?: number;
  credits_used?: number;
  total_pages: number;
  edit_page_calls: number;
  total_tool_calls: number;
  avg_palette_consistency: number;
  structure_quality_percent: number;
  cta_clarity_percent: number;
  html_validity_percent: number;
};

export type FirstGenerationCompleteProperties = {
  project_id?: string;
  time_to_first_gen_ms: number;
  total_pages: number;
};

export type RegenerationRequestedProperties = {
  project_id?: string;
  regeneration_count: number;
  seconds_since_first_gen: number;
};

export type DraftRatedProperties = {
  project_id?: string;
  rating: number;
  is_first_gen: boolean;
  seconds_since_first_gen?: number;
};

export type ProjectSavedProperties = {
  project_id?: string;
  is_first_gen: boolean;
  seconds_since_first_gen: number;
  total_pages: number;
};

export type TimeToPublishProperties = {
  project_id: string;
  time_to_publish_ms: number;
  regeneration_count: number;
  total_pages: number;
};
