export interface DesignEffects {
  roundness: "sharp" | "subtle" | "rounded" | "pill";
  shadow: "none" | "subtle" | "medium" | "dramatic";
  grain: boolean;
  glassmorphism: boolean;
  animations: "none" | "subtle" | "expressive";
}

export interface SiteSpec {
  name: string;
  tagline: string;
  type:
    | "landing"
    | "portfolio"
    | "business"
    | "saas"
    | "restaurant"
    | "agency"
    | "blog"
    | "ecommerce";
  industry: string;
  audience: string;
  tone: "professional" | "casual" | "playful" | "luxurious" | "minimal";
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingStyle: "bold" | "elegant" | "modern" | "classic";
    bodyFont: "sans" | "serif" | "mono";
  };
  designEffects?: DesignEffects;
  pages: PageSpec[];
  features: string[];
}

export interface PageSpec {
  filename: string;
  title: string;
  purpose: string;
  sections: SectionSpec[];
  layoutStrategy?: "centered" | "asymmetric" | "masonry" | "editorial";
}

export interface SectionSpec {
  type: string;
  headline?: string;
  subheadline?: string;
  content: string;
  layout: string;
  elements: string[];
}

export interface GenerationContext {
  spec: SiteSpec;
  currentPages?: Record<string, string>;
  userRequest: string;
}
