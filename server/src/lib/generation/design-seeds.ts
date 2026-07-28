function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

const LAYOUT_STRATEGIES = [
  "asymmetric with one section that breaks the grid rhythm",
  "editorial magazine-style with generous whitespace",
  "centered and symmetrical with strong vertical rhythm",
  "masonry-inspired with varying content block sizes",
  "full-bleed sections alternating with contained sections",
  "single-column with oversized typography",
  "card-based modular layout",
  "split-screen sections with contrasting halves",
];

const SIGNATURE_MOTIFS = [
  "numbered steps with thin divider lines",
  "oversized pull-quotes as visual anchors",
  "subtle dotted borders and fine lines",
  "pill-shaped tags and badges throughout",
  "circular elements and rounded containers",
  "diagonal slashes or angled section dividers",
  "monospace accents for labels and kickers",
  "gradient text highlights on key phrases",
  "outlined/hollow headings with fill on hover",
  "icon-forward design with large inline SVGs",
  "overlapping elements with z-index layering",
  "duotone color blocking",
  "thin underline animations on links",
  "geometric background patterns",
  "large section numbers as decorative elements",
];

const HERO_CONSTRAINTS = [
  "typography-first with no images — let the words command attention",
  "asymmetric split with text on one side and decorative shapes on the other",
  "stacked layout with an oversized headline and a small visual accent below",
  "full-width with a bold background color and centered content",
  "editorial style with a pull-quote and author attribution feel",
  "minimal with a single sentence headline and generous padding",
  "bold gradient background with floating geometric shapes",
  "dark section with glowing accent elements",
];

const CTA_STYLES = [
  "text-link with underline animation (no filled buttons except the primary one)",
  "ghost buttons with colored borders that fill on hover",
  "pill-shaped buttons with subtle shadow",
  "large rectangular buttons with icon arrows",
  "minimal text CTAs with arrow indicators",
  "gradient-filled rounded buttons",
  "outlined buttons that invert colors on hover",
];

const SECTION_ORDER_TWISTS = [
  "lead with a bold statistic or metric before the main hero",
  "place testimonials immediately after the hero for instant social proof",
  "interleave features with mini-testimonials instead of separate sections",
  "end with a story or about section instead of a generic CTA",
  "put the pricing section early to qualify visitors fast",
  "use a process/how-it-works section right after the hero",
  "place a FAQ section before the CTA to handle objections first",
  "open with a logo bar before the hero for instant credibility",
];

const TYPOGRAPHY_TWISTS = [
  "use serif headings for an editorial, authoritative feel",
  "mix weights dramatically — ultra-thin subheads with heavy headlines",
  "use uppercase tracking-widest for section kickers/labels",
  "vary heading sizes significantly between sections for rhythm",
  "use italic emphasis on key phrases within headlines",
  "combine a decorative font for the brand name with clean sans for everything else",
];

const SPACING_PERSONALITIES = [
  "generous and airy — use py-32 and large gaps for a luxury feel",
  "tight and energetic — use py-16 and compact spacing for urgency",
  "mixed rhythm — alternate between spacious and compact sections",
  "uniform and consistent — same padding throughout for a polished grid feel",
];

const VISUAL_TEXTURES = [
  "subtle grain overlay for a premium editorial feel",
  "clean and flat with no textures",
  "soft shadows and depth for a layered, elevated feel",
  "glassmorphism with frosted elements on select cards",
  "subtle pattern backgrounds on alternating sections",
  "gradient meshes as section backgrounds",
];

const FUN_LAYOUT_STRATEGIES = [
  "single centered column — keep it dead simple",
  "one bold hero section with almost nothing else",
  "stacked cards with lots of whitespace between them",
  "everything centered, big text, minimal structure",
];

const FUN_HERO_CONSTRAINTS = [
  "giant emoji as the visual centerpiece with a short punchy headline",
  "one huge bold sentence and a single CTA button — nothing else",
  "big date/time display with a fun subtitle",
  "oversized gradient text headline with emoji accents",
];

const FUN_PERSONALITY_DIRECTIVES = [
  "use emoji liberally as icons and decorative elements",
  "write copy like you're texting a friend — casual, funny, with personality",
  "use ALL CAPS for the main headline for maximum energy",
  "pick one loud accent color and go hard with it",
  "use playful rounded shapes and pill buttons everywhere",
  "make it feel like a poster or flyer, not a corporate website",
  "add fun micro-interactions — hover effects, bouncy buttons",
  "keep the total page under 3 screen heights — short and punchy",
];

export function generateDesignSeed(
  seed?: number,
  complexity?: "minimal" | "fun" | "standard" | "premium",
): string {
  const rng = mulberry32(seed ?? Date.now());

  if (complexity === "minimal" || complexity === "fun") {
    const maxSections = complexity === "minimal" ? "1-2" : "3-5";
    const layout = pick(FUN_LAYOUT_STRATEGIES, rng);
    const heroApproach = pick(FUN_HERO_CONSTRAINTS, rng);
    const directives = pickN(FUN_PERSONALITY_DIRECTIVES, 3, rng);

    return `## DESIGN SEED — ${complexity.toUpperCase()} MODE (follow these creative directions)

This is a ${complexity} site. Keep it SHORT and FUN. Maximum ${maxSections} sections total.

- **Layout:** ${layout}
- **Hero approach:** ${heroApproach}
- **Personality directives:**
${directives.map((d) => `  - ${d}`).join("\n")}

IMPORTANT RULES FOR ${complexity.toUpperCase()} SITES:
- Do NOT over-engineer this. Less is more. A party invite doesn't need 8 sections.
- Prioritize personality and fun over professionalism and completeness.
- Emoji are your best friend for visual interest without complexity.
- If the user asked for something simple/funny, lean into it — don't corporate-ify their vision.
- Skip sections that feel forced. No testimonials section for a birthday party. No pricing for a meme page.`;
  }

  const layout = pick(LAYOUT_STRATEGIES, rng);
  const motifs = pickN(SIGNATURE_MOTIFS, 2, rng);
  const heroConstraint = pick(HERO_CONSTRAINTS, rng);
  const ctaStyle = pick(CTA_STYLES, rng);
  const sectionTwist = pick(SECTION_ORDER_TWISTS, rng);
  const typographyTwist = pick(TYPOGRAPHY_TWISTS, rng);
  const spacing = pick(SPACING_PERSONALITIES, rng);
  const texture = pick(VISUAL_TEXTURES, rng);

  return `## DESIGN SEED (follow these creative directions for this specific site)

- **Layout strategy:** ${layout}
- **Signature motifs:** ${motifs.join("; ")}
- **Hero approach:** ${heroConstraint}
- **CTA style:** ${ctaStyle}
- **Section ordering twist:** ${sectionTwist}
- **Typography twist:** ${typographyTwist}
- **Spacing personality:** ${spacing}
- **Visual texture:** ${texture}

These directions are MANDATORY for this generation. They exist to ensure every site feels unique. Do not fall back to generic patterns — embrace these constraints as creative fuel.`;
}
