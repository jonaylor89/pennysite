-- Pending generations table for guest checkout flow
-- Stores the prompt and user mapping between Stripe checkout and generation

CREATE TABLE IF NOT EXISTS pending_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  consumed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour'
);

-- Index for quick lookup by session ID (only unconsumed)
CREATE INDEX idx_pending_generations_session 
  ON pending_generations(checkout_session_id) 
  WHERE consumed_at IS NULL;

-- Index for cleanup of expired records
CREATE INDEX idx_pending_generations_expires 
  ON pending_generations(expires_at);

-- RLS: Only service role can access this table
ALTER TABLE pending_generations ENABLE ROW LEVEL SECURITY;

-- No policies = only service role / admin can access
-- This is intentional for security

COMMENT ON TABLE pending_generations IS 'Temporary storage for guest checkout flow. Links Stripe session to user and prompt.';
