# Analytics & Metrics Tracking

Pennysite uses PostHog for comprehensive analytics tracking. This document describes the events captured and how to set up dashboards for monitoring key metrics.

## Event Reference

### Output Quality Events

| Event | Location | Description |
|-------|----------|-------------|
| `generation_completed` | Server | Full generation metrics including quality scores |
| `generation_failed` | Server | Failed generation with error details |

**`generation_completed` Properties:**
- `project_id` - Project identifier
- `input_tokens` / `output_tokens` - Token usage
- `credits_used` - Credits consumed
- `total_pages` - Number of pages generated
- `fix_page_calls` - Number of fix attempts
- `total_tool_calls` - Total agent tool calls
- `html_validity_percent` - % of pages passing validation on first try
- `avg_palette_consistency` - % of palette colors used across pages
- `structure_quality_percent` - % of pages with correct heading hierarchy
- `cta_clarity_percent` - % of pages with CTA above the fold

### User Experience Events

| Event | Location | Description |
|-------|----------|-------------|
| `first_generation_complete` | Client | First successful generation in session |
| `regeneration_requested` | Client | User triggered a regeneration |
| `time_to_publish` | Client | Time from session start to publish |

**`first_generation_complete` Properties:**
- `project_id`
- `time_to_first_gen_ms` - Milliseconds from page load to first gen
- `total_pages`

**`regeneration_requested` Properties:**
- `project_id`
- `regeneration_count` - Total regenerations this session
- `seconds_since_first_gen`

**`time_to_publish` Properties:**
- `project_id`
- `time_to_publish_ms`
- `regeneration_count`
- `total_pages`

### Perceived Quality Events

| Event | Location | Description |
|-------|----------|-------------|
| `draft_rated` | Client | User rated a generated draft (1-5 stars) |
| `project_saved` | Client | User clicked Save Project |

**`draft_rated` Properties:**
- `project_id`
- `rating` - 1-5 star rating
- `is_first_gen` - Whether this was the first generation
- `seconds_since_first_gen`

**`project_saved` Properties:**
- `project_id`
- `is_first_gen`
- `seconds_since_first_gen`
- `total_pages`

## PostHog Dashboard Setup

### 1. Output Quality Dashboard

Create these Insights:

**HTML Validity Rate (Trend)**
```
Event: generation_completed
Breakdown: None
Formula: Average of html_validity_percent
```

**Visual Consistency (Trend)**
```
Event: generation_completed
Breakdown: None
Formula: Average of avg_palette_consistency
```

**Structure Quality (Trend)**
```
Event: generation_completed
Breakdown: None
Formula: Average of structure_quality_percent
```

**CTA Clarity (Trend)**
```
Event: generation_completed
Breakdown: None
Formula: Average of cta_clarity_percent
```

**Fix-loop Rate (Trend)**
```
Event: generation_completed
Filter: fix_page_calls > 1
Formula: Count / Total generation_completed events
```

### 2. User Experience Dashboard

**First-Gen Success Rate (Funnel)**
```
Step 1: first_generation_complete
Step 2: regeneration_requested (within 2 minutes) - EXCLUDE
Success = Users who don't trigger Step 2
```

**Time to Publish (Trend)**
```
Event: time_to_publish
Formula: Median of time_to_publish_ms
Display as: Minutes (divide by 60000)
```

**Avg Regenerations per Project (Trend)**
```
Event: regeneration_requested
Breakdown by: project_id
Formula: Count / Unique project_id
```

### 3. Perceived Quality Dashboard

**User Rating Distribution (Bar Chart)**
```
Event: draft_rated
Breakdown: rating
Formula: Count
```

**Average Rating (Number)**
```
Event: draft_rated
Formula: Average of rating
```

**Save Rate Funnel**
```
Step 1: first_generation_complete
Step 2: project_saved
Filter Step 2: is_first_gen = true
```

### 4. Cost Efficiency Dashboard

**Token Cost per Published Project**
```
Event: generation_completed
Filter: (Join with project_published by project_id)
Formula: Sum of credits_used / Count of unique project_id
```

**Fix-loop Rate Over Time**
```
Event: generation_completed
Formula: (Count where fix_page_calls > 1) / Total Count
Target: < 50%
```

## Target Metrics

| Metric | Target | Event/Property |
|--------|--------|----------------|
| Visual consistency | 90%+ | `avg_palette_consistency` |
| HTML validity | 80%+ | `html_validity_percent` |
| Structure quality | 95%+ | `structure_quality_percent` |
| CTA clarity | 85%+ | `cta_clarity_percent` |
| First-gen success | +20% lift | Funnel: no regen in 2 min |
| Time-to-publish | -30% | `time_to_publish_ms` median |
| Regeneration count | -25% | `regeneration_count` avg |
| User rating | +0.5 | `rating` average |
| Save rate | +15% | Save funnel conversion |
| Token cost per publish | -20% | `credits_used` sum |
| Fix-loop rate | -50% | `fix_page_calls > 1` % |

## Implementation Files

- `src/lib/analytics/html-quality.ts` - HTML quality analysis utilities
- `src/lib/analytics/events.ts` - Event name constants and types
- `src/lib/posthog/server.ts` - Server-side event tracking
- `src/lib/posthog/client.ts` - Client-side event tracking
- `src/app/components/RatingModal.tsx` - Draft rating UI
- `src/app/components/BuilderUI.tsx` - Client-side event triggers
- `src/app/api/generate/route.ts` - Server-side generation metrics
