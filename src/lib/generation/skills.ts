/**
 * Enhancement skills - prompt templates that improve generated websites
 * Each skill takes existing HTML and returns improved HTML
 */

export type SkillId = "seo" | "accessibility" | "performance" | "darkMode";

export interface Skill {
  id: SkillId;
  name: string;
  icon: string;
  description: string;
  prompt: string;
}

export const SKILLS: Record<SkillId, Skill> = {
  seo: {
    id: "seo",
    name: "SEO Boost",
    icon: "🔍",
    description: "Add meta tags, Open Graph, and structured data",
    prompt: `You are an SEO expert. Improve this HTML for search engine optimization.

## Required Changes

1. **Meta Description**: Add a compelling <meta name="description"> tag (150-160 chars) that summarizes the page content and includes relevant keywords.

2. **Open Graph Tags**: Add these Open Graph meta tags in <head>:
   - <meta property="og:title" content="...">
   - <meta property="og:description" content="...">
   - <meta property="og:type" content="website">
   - <meta property="og:url" content="..."> (use a placeholder URL)

3. **Twitter Card Tags**: Add Twitter card meta tags:
   - <meta name="twitter:card" content="summary_large_image">
   - <meta name="twitter:title" content="...">
   - <meta name="twitter:description" content="...">

4. **Semantic HTML**: Replace generic <div> elements with semantic alternatives where appropriate:
   - Use <header> for the site header/navigation
   - Use <nav> for navigation menus
   - Use <main> for the primary content area
   - Use <section> for distinct content sections
   - Use <article> for self-contained content
   - Use <footer> for the page footer
   - Use <aside> for sidebars or tangential content

5. **Heading Hierarchy**: Ensure there is exactly ONE <h1> tag (the main page title), and headings follow a logical hierarchy (h1 → h2 → h3, no skipping levels).

6. **Structured Data**: Add JSON-LD structured data in a <script type="application/ld+json"> tag for the business/website type.

## Output
Return the complete improved HTML. Make minimal changes - only add what's needed for SEO. Do not change the visual design or layout.`,
  },

  accessibility: {
    id: "accessibility",
    name: "Accessibility",
    icon: "♿",
    description: "WCAG compliance, ARIA labels, keyboard navigation",
    prompt: `You are an accessibility expert. Improve this HTML for WCAG 2.1 AA compliance.

## Required Changes

1. **Language Attribute**: Ensure <html> has a lang attribute: <html lang="en">

2. **Skip Link**: Add a skip-to-content link as the first element in <body>:
   <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-black">Skip to content</a>
   And add id="main-content" to the <main> element.

3. **Image Alt Text**: Ensure ALL <img> tags have meaningful alt attributes. For decorative images, use alt="". For informative images, describe the content.

4. **Form Labels**: Ensure all form inputs have associated <label> elements with matching for/id attributes. Add aria-label for inputs without visible labels.

5. **Button Accessibility**: Ensure all <button> elements have accessible names (text content or aria-label). Add type="button" to non-submit buttons.

6. **Link Purpose**: Ensure links have descriptive text. Avoid "click here" or "read more" - use "Read more about pricing" instead. Add aria-label when link text is not descriptive.

7. **Focus Indicators**: Add focus-visible styles. Ensure interactive elements have visible focus states:
   - Add "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" to buttons and links
   - Or use "focus-visible:ring-2 focus-visible:ring-blue-500" for keyboard-only focus

8. **Color Contrast**: If any text appears to have low contrast (light gray on white, etc.), adjust the text color to meet WCAG AA requirements (4.5:1 for normal text, 3:1 for large text).

9. **ARIA Landmarks**: Add appropriate ARIA roles if not using semantic HTML:
   - role="navigation" for nav areas
   - role="main" for main content
   - role="banner" for header
   - role="contentinfo" for footer

10. **Screen Reader Only Text**: For icon-only buttons, add visually hidden text:
    <span class="sr-only">Menu</span>

## Tailwind sr-only class
If not present, add this to a <style> tag:
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }

## Output
Return the complete improved HTML. Preserve all existing functionality and visual design.`,
  },

  performance: {
    id: "performance",
    name: "Performance",
    icon: "⚡",
    description: "Lazy loading, optimized assets, faster load times",
    prompt: `You are a web performance expert. Optimize this HTML for faster loading.

## Required Changes

1. **Lazy Loading Images**: Add loading="lazy" to all <img> tags that are below the fold (not in the hero/header area). First visible image should NOT be lazy loaded.

2. **Font Display**: Add font-display: swap to Google Font imports:
   Change: fonts.googleapis.com/css2?family=...
   To: fonts.googleapis.com/css2?family=...&display=swap

3. **Preconnect Hints**: Add preconnect hints in <head> for external resources:
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link rel="preconnect" href="https://cdn.tailwindcss.com">

4. **Defer Non-Critical JS**: Ensure Alpine.js and other non-critical scripts have defer attribute:
   <script defer src="..."></script>

5. **Image Dimensions**: Add explicit width and height attributes to images to prevent layout shift (use reasonable defaults like width="400" height="300" if unknown).

6. **Reduce DOM Size**: If there are deeply nested div wrappers that serve no styling purpose, flatten them.

7. **Critical CSS Hint**: Add a comment at the top of <head> noting which styles are critical:
   <!-- Critical: hero section, navigation, above-fold content -->

8. **Async Decorative Elements**: For decorative animations or effects that aren't essential, ensure they load after main content.

## Output
Return the complete optimized HTML. Do not remove any functionality or visual elements.`,
  },

  darkMode: {
    id: "darkMode",
    name: "Dark Mode",
    icon: "🌙",
    description: "Add theme toggle with system preference support",
    prompt: `You are a frontend expert. Add dark mode support to this HTML.

## Required Changes

1. **CSS Variables**: Add CSS custom properties in a <style> tag for colors that should change:
   <style>
     :root {
       --bg-primary: #ffffff;
       --bg-secondary: #f9fafb;
       --text-primary: #111827;
       --text-secondary: #4b5563;
       --border-color: #e5e7eb;
     }
     .dark {
       --bg-primary: #111827;
       --bg-secondary: #1f2937;
       --text-primary: #f9fafb;
       --text-secondary: #9ca3af;
       --border-color: #374151;
     }
   </style>

2. **Theme Toggle Button**: Add a theme toggle button in the navigation/header:
   <button 
     type="button"
     onclick="toggleTheme()"
     class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
     aria-label="Toggle dark mode"
   >
     <span class="dark:hidden">🌙</span>
     <span class="hidden dark:inline">☀️</span>
   </button>

3. **Theme Script**: Add this script BEFORE the closing </head> tag (to prevent flash):
   <script>
     // Check for saved theme or system preference
     if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
       document.documentElement.classList.add('dark');
     }
     function toggleTheme() {
       document.documentElement.classList.toggle('dark');
       localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
     }
   </script>

4. **Tailwind Dark Classes**: Update existing Tailwind classes to include dark mode variants:
   - bg-white → bg-white dark:bg-gray-900
   - bg-gray-50 → bg-gray-50 dark:bg-gray-800
   - text-gray-900 → text-gray-900 dark:text-white
   - text-gray-600 → text-gray-600 dark:text-gray-300
   - border-gray-200 → border-gray-200 dark:border-gray-700

5. **Transition**: Add smooth color transitions:
   Add to <html> or <body>: class="transition-colors duration-200"

## Important
- Maintain the existing light mode appearance exactly
- Dark mode should look good and have proper contrast
- Focus on backgrounds, text, and borders primarily

## Output
Return the complete HTML with dark mode support added.`,
  },
};

export function getSkill(id: SkillId): Skill | undefined {
  return SKILLS[id];
}

export function getAllSkills(): Skill[] {
  return Object.values(SKILLS);
}
