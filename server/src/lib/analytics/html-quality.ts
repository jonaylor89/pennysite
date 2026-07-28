/**
 * HTML Quality Analysis Utilities for PostHog Metrics
 *
 * These utilities analyze generated HTML to compute output quality metrics:
 * - Visual consistency (palette token usage)
 * - Structure quality (heading hierarchy)
 * - CTA clarity (primary CTA above the fold)
 */

export type ColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
};

export type HtmlQualityMetrics = {
  hasSingleH1: boolean;
  hasOrderedHeadings: boolean;
  hasCtaAboveFold: boolean;
  paletteColorsUsed: number;
  paletteColorsMissing: string[];
  totalPaletteColors: number;
  paletteConsistencyPercent: number;
};

/**
 * Check if HTML has a single H1 and ordered heading hierarchy (H1 -> H2 -> H3)
 */
export function analyzeHeadingStructure(html: string): {
  hasSingleH1: boolean;
  hasOrderedHeadings: boolean;
} {
  const h1Matches = html.match(/<h1[\s>]/gi) || [];
  const hasSingleH1 = h1Matches.length === 1;

  const headingMatches = html.match(/<h([1-6])[\s>]/gi) || [];
  const levels = headingMatches.map((match) => {
    const levelMatch = match.match(/<h([1-6])/i);
    return levelMatch ? Number.parseInt(levelMatch[1], 10) : 0;
  });

  let hasOrderedHeadings = true;
  let maxSeenLevel = 0;

  for (const level of levels) {
    if (level > maxSeenLevel + 1 && maxSeenLevel > 0) {
      hasOrderedHeadings = false;
      break;
    }
    maxSeenLevel = Math.max(maxSeenLevel, level);
  }

  return { hasSingleH1, hasOrderedHeadings };
}

/**
 * Check if there's a CTA (button/link with action words) in the first ~600px of content
 * Approximation: look for CTAs in the first 3000 chars or before first major section break
 */
export function hasCtaAboveFold(html: string): boolean {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)/i);
  if (!bodyMatch) return false;

  const bodyContent = bodyMatch[1];

  const firstSectionEnd = Math.min(
    bodyContent.indexOf("</section>") > 0
      ? bodyContent.indexOf("</section>")
      : 5000,
    bodyContent.indexOf("</header>") > 0
      ? bodyContent.indexOf("</header>") + 500
      : 5000,
    3000,
  );

  const aboveFoldContent = bodyContent.slice(0, firstSectionEnd);

  const ctaPatterns = [
    /<button[^>]*>.*?(get started|sign up|try|start|buy|shop|learn more|contact|subscribe|join|download|book|order|request|explore)/i,
    /<a[^>]*href[^>]*>.*?(get started|sign up|try|start|buy|shop|learn more|contact|subscribe|join|download|book|order|request|explore)/i,
    /<a[^>]*class="[^"]*btn[^"]*"[^>]*>/i,
    /<a[^>]*class="[^"]*button[^"]*"[^>]*>/i,
    /<button[^>]*class="[^"]*bg-/i,
  ];

  return ctaPatterns.some((pattern) => pattern.test(aboveFoldContent));
}

/**
 * Check how many palette colors are used in the HTML
 */
export function analyzePaletteUsage(
  html: string,
  palette: ColorPalette,
): {
  colorsUsed: number;
  colorsMissing: string[];
  totalColors: number;
  consistencyPercent: number;
} {
  const paletteColors = [
    { name: "primary", value: palette.primary },
    { name: "secondary", value: palette.secondary },
    { name: "accent", value: palette.accent },
    { name: "background", value: palette.background },
    { name: "text", value: palette.text },
  ];

  const colorsMissing: string[] = [];
  let colorsUsed = 0;

  for (const color of paletteColors) {
    const hexLower = color.value.toLowerCase();
    const hexUpper = color.value.toUpperCase();
    const htmlLower = html.toLowerCase();

    if (htmlLower.includes(hexLower) || html.includes(hexUpper)) {
      colorsUsed++;
    } else {
      colorsMissing.push(color.name);
    }
  }

  const totalColors = paletteColors.length;
  const consistencyPercent = Math.round((colorsUsed / totalColors) * 100);

  return { colorsUsed, colorsMissing, totalColors, consistencyPercent };
}

/**
 * Analyze all HTML quality metrics for a single page
 */
export function analyzePageQuality(
  html: string,
  palette?: ColorPalette,
): HtmlQualityMetrics {
  const headingAnalysis = analyzeHeadingStructure(html);
  const ctaCheck = hasCtaAboveFold(html);

  let paletteAnalysis = {
    colorsUsed: 0,
    colorsMissing: [] as string[],
    totalColors: 5,
    consistencyPercent: 0,
  };

  if (palette) {
    paletteAnalysis = analyzePaletteUsage(html, palette);
  }

  return {
    hasSingleH1: headingAnalysis.hasSingleH1,
    hasOrderedHeadings: headingAnalysis.hasOrderedHeadings,
    hasCtaAboveFold: ctaCheck,
    paletteColorsUsed: paletteAnalysis.colorsUsed,
    paletteColorsMissing: paletteAnalysis.colorsMissing,
    totalPaletteColors: paletteAnalysis.totalColors,
    paletteConsistencyPercent: paletteAnalysis.consistencyPercent,
  };
}

/**
 * Aggregate quality metrics across all pages
 */
export function aggregateSiteQuality(
  pages: Record<string, string>,
  palette?: ColorPalette,
): {
  totalPages: number;
  pagesWithSingleH1: number;
  pagesWithOrderedHeadings: number;
  pagesWithCtaAboveFold: number;
  avgPaletteConsistency: number;
  structureQualityPercent: number;
  ctaClarityPercent: number;
} {
  const pageEntries = Object.entries(pages);
  const totalPages = pageEntries.length;

  if (totalPages === 0) {
    return {
      totalPages: 0,
      pagesWithSingleH1: 0,
      pagesWithOrderedHeadings: 0,
      pagesWithCtaAboveFold: 0,
      avgPaletteConsistency: 0,
      structureQualityPercent: 0,
      ctaClarityPercent: 0,
    };
  }

  let pagesWithSingleH1 = 0;
  let pagesWithOrderedHeadings = 0;
  let pagesWithCtaAboveFold = 0;
  let totalPaletteConsistency = 0;

  for (const [, html] of pageEntries) {
    const metrics = analyzePageQuality(html, palette);

    if (metrics.hasSingleH1) pagesWithSingleH1++;
    if (metrics.hasOrderedHeadings) pagesWithOrderedHeadings++;
    if (metrics.hasCtaAboveFold) pagesWithCtaAboveFold++;
    totalPaletteConsistency += metrics.paletteConsistencyPercent;
  }

  return {
    totalPages,
    pagesWithSingleH1,
    pagesWithOrderedHeadings,
    pagesWithCtaAboveFold,
    avgPaletteConsistency: Math.round(totalPaletteConsistency / totalPages),
    structureQualityPercent: Math.round(
      (pagesWithOrderedHeadings / totalPages) * 100,
    ),
    ctaClarityPercent: Math.round((pagesWithCtaAboveFold / totalPages) * 100),
  };
}
