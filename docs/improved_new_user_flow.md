# Improved New User Flow

## Problem

The current flow has **3 interruption points**, each a potential drop-off:

```
Landing → Enter prompt → [Auth Wall] → [Credit Wall] → Generate
```

Users must:
1. Enter their prompt
2. Get redirected to `/auth/login` to create an account
3. Return to builder, hit send again
4. See credit wall modal with 4 pack options
5. Complete Stripe checkout
6. Return to builder, hit send again
7. Finally see their generated website

---

## Solution: Single Combined Gate

Reduce to **one interruption** after the user shows intent:

```
Landing → Enter prompt → Hit Send → [Sign up + Pay $5] → Generate → Set Password → Save/Publish
```

---

## Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              NEW USER JOURNEY                                 │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐         ┌─────────────┐         ┌──────────────────┐
    │ Landing │────────▶│ /project/new│────────▶│ Enter prompt     │
    │  Page   │         │             │         │ + Click "Send"   │
    └─────────┘         └─────────────┘         └────────┬─────────┘
                                                         │
                                                         ▼
                                          ┌──────────────────────────┐
                                          │   GuestCheckoutModal     │
                                          │                          │
                                          │   "Generate Your Site"   │
                                          │   [email input]          │
                                          │   [Continue — $5]        │
                                          └────────────┬─────────────┘
                                                       │
                                                       ▼
                                          ┌──────────────────────────┐
                                          │    Stripe Checkout       │
                                          │    - Collects payment    │
                                          │    - $5 for 100 credits  │
                                          └────────────┬─────────────┘
                                                       │
                              ┌─────────────────────────────────────────┐
                              │              WEBHOOK                     │
                              │  1. Create user account (passwordless)  │
                              │  2. Add 100 credits                     │
                              │  3. Store pending generation            │
                              └─────────────────────────────────────────┘
                                                       │
                                                       ▼
                                          ┌──────────────────────────┐
                                          │ Redirect to builder      │
                                          │ ?session_id=cs_xxx       │
                                          └────────────┬─────────────┘
                                                       │
                                                       ▼
                                          ┌──────────────────────────┐
                                          │ Retrieve prompt from     │
                                          │ session, establish auth, │
                                          │ auto-trigger generation  │
                                          └────────────┬─────────────┘
                                                       │
                                                       ▼
                                          ┌──────────────────────────┐
                                          │ User sees generated      │
                                          │ website in preview       │
                                          └────────────┬─────────────┘
                                                       │
                                                       ▼
                                          ┌──────────────────────────┐
                                          │ SetPasswordModal         │
                                          │ "Secure your account"    │
                                          │ [password input]         │
                                          │ [Set Password] [Skip]    │
                                          └────────────┬─────────────┘
                                                       │
                                                       ▼
                                          ┌──────────────────────────┐
                                          │ Save / Iterate / Publish │
                                          └──────────────────────────┘
```

---

## Pricing

| Pack | Credits | Price | Generations | Notes |
|------|---------|-------|-------------|-------|
| Starter | 100 | $5.00 | ~1 full site | Used for guest checkout |
| Basic | 440 | $20.00 | ~4 | Popular |
| Pro | 1200 | $50.00 | ~12 | |
| Max | 2600 | $100.00 | ~26 | |

**Credit Economics:**
- Typical multi-page generation costs ~100 credits (3 pages)
- Simple single-page sites cost ~30-50 credits
- Each iteration/edit costs ~20-40 credits
- System reserves up to 150 credits as safety buffer, refunds unused

---

## Authentication Strategy

### Guest Checkout Creates Passwordless User

When a user completes guest checkout:
1. Stripe webhook fires with their email
2. We create a Supabase user via Admin API (no password)
3. Session is established automatically on redirect back
4. User is fully authenticated and can generate, save, publish

### Post-Generation: Set Password Prompt

After first successful generation, show a modal:

```
┌─────────────────────────────────────────┐
│                                         │
│  🎉 Your site is ready!                 │
│                                         │
│  Set a password to access your          │
│  projects from any device.              │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Password                        │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ Confirm password                │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Set Password]         [Skip for now]  │
│                                         │
└─────────────────────────────────────────┘
```

- Uses `supabase.auth.updateUser({ password })` while session active
- If skipped, session persists (~1 week by default)
- User can set password later from account settings

### Returning Users: Magic Link Fallback

Update `/auth/login` to handle passwordless users:

1. User enters email
2. If user exists with password → show password field
3. If user exists without password → auto-send magic link
4. Show message: "Check your email for a login link"

```typescript
// Login flow
async function handleLogin(email: string) {
  // Check if user has password set
  const { data } = await supabase.auth.signInWithPassword({ 
    email, 
    password: '' // Will fail, but tells us user exists
  });
  
  if (error?.message?.includes('Invalid login credentials')) {
    // User has password - show password field
    setShowPasswordField(true);
  } else {
    // User is passwordless - send magic link
    await supabase.auth.signInWithOtp({ email });
    setMessage("Check your email for a login link");
  }
}
```

---

## Implementation Components

### 1. New Credit Pack

```typescript
// src/lib/stripe/packs.ts
{
  id: "first-site",
  name: "First Site",
  credits: 50,
  priceUsd: 5,
  stripePriceId: process.env.STRIPE_PRICE_FIRST_SITE || "",
}
```

Create in Stripe Dashboard: $5.00 one-time payment product.

### 2. Guest Checkout Endpoint

```
POST /api/billing/guest-checkout
```

**Request:**
```json
{
  "email": "user@example.com",
  "prompt": "A landing page for my coffee shop..."
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

**Implementation:**
```typescript
// src/app/api/billing/guest-checkout/route.ts
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getStripe } from "@/lib/stripe/stripe";

export async function POST(req: Request) {
  const { email, prompt } = await req.json();
  
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  // Sign the prompt as a JWT (expires in 1 hour)
  const promptToken = await new SignJWT({ prompt, email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  const stripe = getStripe();
  const origin = req.headers.get("origin") || "https://pennysite.app";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email || undefined,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_FIRST_SITE,
        quantity: 1,
      },
    ],
    metadata: {
      prompt_token: promptToken,
      flow: "guest_checkout",
      credits: "50",
    },
    success_url: `${origin}/project/new?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/project/new?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
```

### 3. Database: Pending Generations Table

```sql
-- supabase/migrations/xxx_pending_generations.sql
CREATE TABLE pending_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  prompt_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  consumed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour'
);

-- Index for quick lookup
CREATE INDEX idx_pending_generations_session 
  ON pending_generations(checkout_session_id) 
  WHERE consumed_at IS NULL;

-- RLS: service role only
ALTER TABLE pending_generations ENABLE ROW LEVEL SECURITY;
```

### 4. Enhanced Webhook Handler

```typescript
// src/app/api/billing/webhook/route.ts (additions)

if (event.type === "checkout.session.completed") {
  const session = event.data.object;
  
  if (session.metadata?.flow === "guest_checkout") {
    const email = session.customer_email || session.customer_details?.email;
    const promptToken = session.metadata.prompt_token;
    const credits = parseInt(session.metadata.credits || "50", 10);
    
    if (!email) {
      console.error("No email in guest checkout");
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }
    
    // Create or get user
    const user = await getOrCreateUserByEmail(email);
    
    // Add credits
    await addCreditsFromPurchase(user.id, credits, event.id);
    
    // Store pending generation for retrieval
    await storePendingGeneration(session.id, user.id, promptToken);
    
    console.log(`Guest checkout complete: ${email}, ${credits} credits`);
    
  } else {
    // Existing authenticated user flow
    const userId = session.metadata?.user_id;
    const credits = parseInt(session.metadata?.credits || "0", 10);
    // ... existing logic ...
  }
}
```

### 5. User Creation Helper

```typescript
// src/lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function getOrCreateUserByEmail(email: string) {
  const supabase = createAdminClient();
  
  // Check if user exists
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const existing = users?.find(u => u.email === email);
  
  if (existing) {
    return existing;
  }
  
  // Create passwordless user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true, // Auto-confirm since they paid
    user_metadata: { 
      source: "guest_checkout",
      needs_password: true,
    },
  });
  
  if (error) throw error;
  return data.user;
}

export async function storePendingGeneration(
  checkoutSessionId: string,
  userId: string,
  promptToken: string
) {
  const supabase = createAdminClient();
  
  await supabase.from("pending_generations").insert({
    checkout_session_id: checkoutSessionId,
    user_id: userId,
    prompt_token: promptToken,
  });
}
```

### 6. Session Status Endpoint

```
GET /api/billing/session-status?session_id=cs_xxx
```

```typescript
// src/app/api/billing/session-status/route.ts
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }
  
  const supabase = createAdminClient();
  
  // Get pending generation
  const { data: pending } = await supabase
    .from("pending_generations")
    .select("*")
    .eq("checkout_session_id", sessionId)
    .is("consumed_at", null)
    .single();
  
  if (!pending) {
    return NextResponse.json({ error: "Not found or expired" }, { status: 404 });
  }
  
  // Verify and decode prompt
  const { payload } = await jwtVerify(
    pending.prompt_token,
    new TextEncoder().encode(process.env.JWT_SECRET)
  );
  
  // Mark as consumed
  await supabase
    .from("pending_generations")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", pending.id);
  
  // Generate a magic link for session establishment
  const { data: linkData } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: payload.email as string,
  });
  
  return NextResponse.json({
    prompt: payload.prompt,
    userId: pending.user_id,
    authToken: linkData?.properties?.hashed_token,
  });
}
```

### 7. BuilderUI Updates

```typescript
// src/app/components/BuilderUI.tsx

// New state
const [showGuestCheckout, setShowGuestCheckout] = useState(false);
const [showSetPassword, setShowSetPassword] = useState(false);

// Check for returning session on mount
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  
  if (sessionId) {
    handlePostCheckoutReturn(sessionId);
    // Clean up URL
    window.history.replaceState({}, "", "/project/new");
  }
}, []);

async function handlePostCheckoutReturn(sessionId: string) {
  try {
    const res = await fetch(`/api/billing/session-status?session_id=${sessionId}`);
    const data = await res.json();
    
    if (data.error) {
      setError("Session expired. Please try again.");
      return;
    }
    
    // Establish session via magic link token
    if (data.authToken) {
      await supabase.auth.verifyOtp({
        token_hash: data.authToken,
        type: "magiclink",
      });
    }
    
    // Refresh user state
    const { data: { user: newUser } } = await supabase.auth.getUser();
    setUser(newUser);
    
    // Set prompt and auto-generate
    if (data.prompt) {
      setInput(data.prompt);
      setTimeout(() => {
        handleSend();
      }, 500);
    }
  } catch (err) {
    console.error("Post-checkout error:", err);
    setError("Failed to restore session");
  }
}

// Modified handleSend - show guest checkout if not authed
async function handleSend() {
  if (!input.trim()) return;
  
  if (!user) {
    setShowGuestCheckout(true);
    return;
  }
  
  // ... existing generation logic ...
}

// After successful generation, prompt for password
useEffect(() => {
  if (user?.user_metadata?.needs_password && pages && Object.keys(pages).length > 0) {
    setShowSetPassword(true);
  }
}, [user, pages]);
```

### 8. GuestCheckoutModal Component

```typescript
// src/app/components/GuestCheckoutModal.tsx
"use client";

import { useState } from "react";

export function GuestCheckoutModal({
  prompt,
  onClose,
}: {
  prompt: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/billing/guest-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, prompt }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start checkout");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-4 text-center">
          <div className="mb-3 text-4xl">🚀</div>
          <h2 className="text-xl font-semibold text-white">
            Generate Your Website
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Get 50 credits to create your first site. That's enough for a full
            multi-page website with room to iterate.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading || !email.trim()}
            className="w-full rounded-lg bg-emerald-600 py-3 font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? "Redirecting to checkout..." : "Continue to Payment — $5"}
          </button>

          <p className="text-center text-xs text-zinc-500">
            Already have an account?{" "}
            <a href="/auth/login" className="text-white underline">
              Sign in
            </a>
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-center text-sm text-zinc-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
```

### 9. SetPasswordModal Component

```typescript
// src/app/components/SetPasswordModal.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SetPasswordModal({
  onComplete,
  onSkip,
}: {
  onComplete: () => void;
  onSkip: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSetPassword() {
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { needs_password: false },
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      onComplete();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-4 text-center">
          <div className="mb-3 text-4xl">🎉</div>
          <h2 className="text-xl font-semibold text-white">
            Your site is ready!
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Set a password to access your projects from any device.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            minLength={6}
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="button"
            onClick={handleSetPassword}
            disabled={loading}
            className="w-full rounded-lg bg-white py-3 font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Set Password"}
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="w-full text-center text-sm text-zinc-400 hover:text-white"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 10. Updated Login Page (Magic Link Support)

```typescript
// src/app/auth/login/page.tsx - add magic link fallback

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setMessage(null);

  if (isSignUp) {
    // ... existing signup logic ...
  } else {
    // Try password login first
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // If user exists but is passwordless, offer magic link
      if (error.message.includes("Invalid login credentials") && !password) {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (otpError) {
          setError(otpError.message);
        } else {
          setMessage("Check your email for a login link!");
        }
      } else {
        setError(error.message);
      }
    } else {
      // ... existing success logic ...
    }
  }

  setLoading(false);
}

// Add "Send magic link" button for passwordless login
{!password && (
  <button
    type="button"
    onClick={handleMagicLink}
    className="text-sm text-zinc-400 hover:text-white"
  >
    Send me a login link instead
  </button>
)}
```

---

## Environment Variables

Add to `.env.local`:

```bash
# Guest checkout
STRIPE_PRICE_FIRST_SITE=price_xxx        # $5/50 credits price ID from Stripe
JWT_SECRET=your-secure-random-string      # For signing prompt tokens
SUPABASE_SERVICE_ROLE_KEY=your-key        # For admin user creation
```

---

## Migration Checklist

### Stripe
- [x] Reuses existing `STRIPE_PRICE_STARTER` ($5.00 / 50 credits) — no new product needed

### Database
- [x] Create `pending_generations` table migration
- [x] Add RLS policies (service role only)

### Backend
- [x] Create `/api/billing/guest-checkout` endpoint
- [x] Create `/api/billing/session-status` endpoint
- [x] Update webhook to handle `flow: "guest_checkout"`
- [x] Create `src/lib/supabase/admin.ts` with helper functions
- [x] Add "first-site" pack to `src/lib/stripe/packs.ts`

### Frontend
- [x] Create `GuestCheckoutModal` component
- [x] Create `SetPasswordModal` component
- [x] Update `BuilderUI` to show guest checkout when unauthenticated
- [x] Update `BuilderUI` to handle post-checkout return
- [x] Update `BuilderUI` to show set password prompt after generation
- [x] Update `/auth/login` to support magic link fallback

### Environment
- [ ] Ensure `SUPABASE_SECRET_KEY` is set in production env

---

## Security Considerations

1. **Prompt token is signed (JWT)** — prevents tampering
2. **Token expires in 1 hour** — limits replay window
3. **Consumed flag** — prevents double-use of session
4. **Email verified by Stripe** — payment confirms email ownership
5. **Service role key server-side only** — never exposed to client
6. **Magic link for passwordless users** — secure fallback auth

---

## Metrics to Track

- Conversion: landing → checkout started
- Conversion: checkout started → completed
- Conversion: generation → password set
- Drop-off at each step
- Returning user login method (password vs magic link)
