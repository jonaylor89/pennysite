export type ComponentExampleType =
  | "hero"
  | "features"
  | "testimonials"
  | "pricing"
  | "cta"
  | "footer"
  | "gallery"
  | "contact"
  | "faq"
  | "navbar"
  | "services"
  | "about"
  | "stats"
  | "logos"
  | "team"
  | "process"
  | "bento"
  | "schedule"
  | "menu";

export type ComponentExample = {
  id: string;
  type: ComponentExampleType;
  label: string;
  bestFor: string;
  html: string;
};

export const COMPONENT_EXAMPLES_LIST: ComponentExample[] = [
  {
    id: "hero-bold-typography-focus",
    type: "hero",
    label: "Bold Typography Focus",
    bestFor: "SaaS/Dev Tools",
    html: `<section class="bg-zinc-950 py-32">
  <div class="mx-auto max-w-5xl px-6 text-center">
    <div class="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
      <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="text-sm font-medium text-emerald-400">Now in public beta</span>
    </div>
    <h1 class="text-5xl font-bold tracking-tight text-white md:text-7xl">
      Deploy in seconds,<br>
      <span class="text-zinc-500">not hours</span>
    </h1>
    <p class="mx-auto mt-8 max-w-2xl text-xl text-zinc-400">
      The CLI that turns your local project into a production deployment with a single command. No config files. No drama.
    </p>
    <div class="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <a href="#" class="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-zinc-900 transition hover:bg-zinc-100">
        Get started free
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
      </a>
      <a href="#" class="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-8 py-4 font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
        View on GitHub
      </a>
    </div>
    <!-- Terminal mockup -->
    <div class="mx-auto mt-16 max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
      <div class="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
        <div class="h-3 w-3 rounded-full bg-red-500"></div>
        <div class="h-3 w-3 rounded-full bg-yellow-500"></div>
        <div class="h-3 w-3 rounded-full bg-green-500"></div>
      </div>
      <div class="p-6 font-mono text-sm text-zinc-300">
        <p><span class="text-emerald-400">$</span> npx deploy-magic</p>
        <p class="mt-2 text-zinc-500">✓ Detected Next.js project</p>
        <p class="text-zinc-500">✓ Building for production...</p>
        <p class="text-zinc-500">✓ Deployed to https://your-app.deploy.dev</p>
        <p class="mt-2 text-emerald-400">Done in 12.4s 🚀</p>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "hero-split-layout-with-svg-illustration",
    type: "hero",
    label: "Split Layout with SVG Illustration",
    bestFor: "Consultants/Services",
    html: `<section class="bg-stone-50 py-24">
  <div class="mx-auto max-w-7xl px-6 lg:flex lg:items-center lg:gap-16">
    <div class="lg:w-1/2">
      <p class="text-sm font-semibold uppercase tracking-widest text-amber-600">Executive Coaching</p>
      <h1 class="mt-4 text-4xl font-bold leading-tight text-stone-900 lg:text-5xl">
        Lead with clarity.<br>Grow with purpose.
      </h1>
      <p class="mt-6 text-lg leading-relaxed text-stone-600">
        I help founders and executives break through plateaus, build high-performing teams, and find sustainable success without burning out.
      </p>
      <div class="mt-8 flex flex-col gap-4 sm:flex-row">
        <a href="#" class="inline-flex items-center justify-center rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white transition hover:bg-amber-700">
          Book a Discovery Call
        </a>
        <a href="#" class="inline-flex items-center justify-center rounded-lg border border-stone-300 px-6 py-3 font-medium text-stone-700 transition hover:bg-stone-100">
          Learn More
        </a>
      </div>
      <div class="mt-12 flex items-center gap-8 border-t border-stone-200 pt-8">
        <div>
          <p class="text-3xl font-bold text-stone-900">200+</p>
          <p class="text-sm text-stone-500">Leaders coached</p>
        </div>
        <div>
          <p class="text-3xl font-bold text-stone-900">15 yrs</p>
          <p class="text-sm text-stone-500">Experience</p>
        </div>
        <div>
          <p class="text-3xl font-bold text-stone-900">4.9★</p>
          <p class="text-sm text-stone-500">Client rating</p>
        </div>
      </div>
    </div>
    <div class="mt-16 lg:mt-0 lg:w-1/2">
      <img src="https://illustrations.popsy.co/amber/success.svg" alt="Success illustration" class="w-full">
    </div>
  </div>
</section>`,
  },
  {
    id: "hero-minimal-editorial",
    type: "hero",
    label: "Minimal/Editorial",
    bestFor: "Portfolios/Writers",
    html: `<section class="bg-white py-32">
  <div class="mx-auto max-w-3xl px-6">
    <h1 class="font-serif text-5xl font-normal leading-tight text-gray-900 md:text-6xl">
      I write code that<br>
      <em class="text-gray-400">feels like poetry</em>
    </h1>
    <p class="mt-8 text-xl text-gray-600">
      Senior frontend engineer specializing in beautiful, accessible interfaces. Currently building the future of creative tools at <a href="#" class="underline decoration-amber-400 decoration-2 underline-offset-2 hover:text-amber-600">Studio Co</a>.
    </p>
    <div class="mt-12 flex gap-6">
      <a href="#" class="text-gray-600 transition hover:text-gray-900">
        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
      </a>
      <a href="#" class="text-gray-600 transition hover:text-gray-900">
        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
      </a>
      <a href="#" class="text-gray-600 transition hover:text-gray-900">
        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a>
    </div>
  </div>
</section>`,
  },
  {
    id: "features-icon-grid-with-descriptions",
    type: "features",
    label: "Icon Grid with Descriptions",
    bestFor: "",
    html: `<section class="bg-white py-24">
  <div class="mx-auto max-w-7xl px-6">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900 md:text-4xl">Everything you need to ship fast</h2>
      <p class="mt-4 text-lg text-gray-600">Built for developers who value their time</p>
    </div>
    <div class="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-2xl border border-gray-200 p-8 transition hover:border-gray-300 hover:shadow-lg">
        <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <h3 class="mt-6 text-xl font-semibold text-gray-900">Lightning Fast</h3>
        <p class="mt-3 text-gray-600">Optimized for speed at every layer. Your users will notice the difference.</p>
      </div>
      <div class="rounded-2xl border border-gray-200 p-8 transition hover:border-gray-300 hover:shadow-lg">
        <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        </div>
        <h3 class="mt-6 text-xl font-semibold text-gray-900">Secure by Default</h3>
        <p class="mt-3 text-gray-600">Enterprise-grade security without the complexity. Sleep well at night.</p>
      </div>
      <div class="rounded-2xl border border-gray-200 p-8 transition hover:border-gray-300 hover:shadow-lg">
        <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>
        </div>
        <h3 class="mt-6 text-xl font-semibold text-gray-900">Flexible Architecture</h3>
        <p class="mt-3 text-gray-600">Adapts to your workflow, not the other way around. Customize everything.</p>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "features-alternating-layout-with-illustrations",
    type: "features",
    label: "Alternating Layout with Illustrations",
    bestFor: "",
    html: `<section class="bg-slate-50 py-24">
  <div class="mx-auto max-w-7xl px-6">
    <!-- Feature 1 -->
    <div class="lg:flex lg:items-center lg:gap-16">
      <div class="lg:w-1/2">
        <p class="text-sm font-semibold uppercase tracking-widest text-indigo-600">Automation</p>
        <h3 class="mt-2 text-3xl font-bold text-gray-900">Set it and forget it</h3>
        <p class="mt-4 text-lg text-gray-600">
          Configure once, then watch as your workflows run on autopilot. Focus on what matters while we handle the repetitive stuff.
        </p>
        <ul class="mt-6 space-y-3">
          <li class="flex items-center gap-3 text-gray-700">
            <svg class="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            Scheduled triggers
          </li>
          <li class="flex items-center gap-3 text-gray-700">
            <svg class="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            Webhook integrations
          </li>
          <li class="flex items-center gap-3 text-gray-700">
            <svg class="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            Smart notifications
          </li>
        </ul>
      </div>
      <div class="mt-12 lg:mt-0 lg:w-1/2">
        <img src="https://illustrations.popsy.co/blue/home-office.svg" alt="Automation illustration" class="w-full">
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "testimonials-quote-cards",
    type: "testimonials",
    label: "Quote Cards",
    bestFor: "",
    html: `<section class="bg-white py-24">
  <div class="mx-auto max-w-7xl px-6">
    <h2 class="text-center text-3xl font-bold text-gray-900">Trusted by teams everywhere</h2>
    <div class="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-2xl bg-gray-50 p-8">
        <div class="flex gap-1 text-amber-400">
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
        </div>
        <blockquote class="mt-6 text-gray-700">
          "Cut our deployment time from 2 hours to 5 minutes. The team actually enjoys shipping now."
        </blockquote>
        <div class="mt-6">
          <p class="font-semibold text-gray-900">Sarah Chen</p>
          <p class="text-sm text-gray-500">CTO at Raycast</p>
        </div>
      </div>
      <div class="rounded-2xl bg-gray-50 p-8">
        <div class="flex gap-1 text-amber-400">
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
        </div>
        <blockquote class="mt-6 text-gray-700">
          "Finally, a tool that doesn't require a PhD to configure. It just works."
        </blockquote>
        <div class="mt-6">
          <p class="font-semibold text-gray-900">Marcus Johnson</p>
          <p class="text-sm text-gray-500">Founder at Indie Labs</p>
        </div>
      </div>
      <div class="rounded-2xl bg-gray-50 p-8">
        <div class="flex gap-1 text-amber-400">
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
        </div>
        <blockquote class="mt-6 text-gray-700">
          "Our engineers were skeptical at first. Now they won't use anything else."
        </blockquote>
        <div class="mt-6">
          <p class="font-semibold text-gray-900">Elena Rodriguez</p>
          <p class="text-sm text-gray-500">VP Engineering at ScaleUp</p>
        </div>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "pricing-simple-three-tier",
    type: "pricing",
    label: "Simple Three Tier",
    bestFor: "",
    html: `<section class="bg-slate-50 py-24">
  <div class="mx-auto max-w-7xl px-6">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900">Simple, honest pricing</h2>
      <p class="mt-4 text-lg text-gray-600">No surprises. No hidden fees. Cancel anytime.</p>
    </div>
    <div class="mt-16 grid gap-8 lg:grid-cols-3">
      <!-- Starter -->
      <div class="rounded-2xl bg-white p-8 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900">Starter</h3>
        <p class="mt-2 text-gray-600">For side projects</p>
        <p class="mt-6"><span class="text-4xl font-bold text-gray-900">$0</span><span class="text-gray-500">/month</span></p>
        <ul class="mt-8 space-y-4 text-gray-600">
          <li class="flex items-center gap-3">
            <svg class="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            3 projects
          </li>
          <li class="flex items-center gap-3">
            <svg class="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Community support
          </li>
        </ul>
        <a href="#" class="mt-8 block rounded-lg border border-gray-300 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50">Get started</a>
      </div>
      <!-- Pro (highlighted) -->
      <div class="relative rounded-2xl bg-indigo-600 p-8 text-white shadow-xl">
        <div class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-sm font-semibold text-amber-900">Most popular</div>
        <h3 class="text-lg font-semibold">Pro</h3>
        <p class="mt-2 text-indigo-200">For serious builders</p>
        <p class="mt-6"><span class="text-4xl font-bold">$29</span><span class="text-indigo-200">/month</span></p>
        <ul class="mt-8 space-y-4 text-indigo-100">
          <li class="flex items-center gap-3">
            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Unlimited projects
          </li>
          <li class="flex items-center gap-3">
            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Priority support
          </li>
          <li class="flex items-center gap-3">
            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Advanced analytics
          </li>
        </ul>
        <a href="#" class="mt-8 block rounded-lg bg-white py-3 text-center font-semibold text-indigo-600 transition hover:bg-indigo-50">Get started</a>
      </div>
      <!-- Enterprise -->
      <div class="rounded-2xl bg-white p-8 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900">Enterprise</h3>
        <p class="mt-2 text-gray-600">For large teams</p>
        <p class="mt-6"><span class="text-4xl font-bold text-gray-900">Custom</span></p>
        <ul class="mt-8 space-y-4 text-gray-600">
          <li class="flex items-center gap-3">
            <svg class="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Everything in Pro
          </li>
          <li class="flex items-center gap-3">
            <svg class="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            SSO & SAML
          </li>
          <li class="flex items-center gap-3">
            <svg class="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Dedicated support
          </li>
        </ul>
        <a href="#" class="mt-8 block rounded-lg border border-gray-300 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50">Contact sales</a>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "cta-simple-centered",
    type: "cta",
    label: "Simple Centered",
    bestFor: "",
    html: `<section class="bg-indigo-600 py-24">
  <div class="mx-auto max-w-4xl px-6 text-center">
    <h2 class="text-3xl font-bold text-white md:text-4xl">Ready to ship faster?</h2>
    <p class="mt-4 text-xl text-indigo-100">Join 10,000+ developers who've already made the switch.</p>
    <div class="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <a href="#" class="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-indigo-600 transition hover:bg-indigo-50">
        Start free trial
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
      </a>
      <a href="#" class="font-medium text-white underline underline-offset-4 transition hover:text-indigo-100">Schedule a demo</a>
    </div>
  </div>
</section>`,
  },
  {
    id: "navbar-clean-with-mobile-menu",
    type: "navbar",
    label: "Clean with Mobile Menu",
    bestFor: "",
    html: `<nav class="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200" x-data="{ open: false }">
  <div class="mx-auto max-w-7xl px-6">
    <div class="flex h-16 items-center justify-between">
      <a href="/" class="text-xl font-bold text-gray-900">Brand</a>
      <div class="hidden items-center gap-8 md:flex">
        <a href="#features" class="text-sm text-gray-600 transition hover:text-gray-900">Features</a>
        <a href="#pricing" class="text-sm text-gray-600 transition hover:text-gray-900">Pricing</a>
        <a href="#about" class="text-sm text-gray-600 transition hover:text-gray-900">About</a>
        <a href="#" class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800">Get Started</a>
      </div>
      <button @click="open = !open" class="text-gray-600 md:hidden">
        <svg x-show="!open" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        <svg x-show="open" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  </div>
  <div x-show="open" x-transition class="border-t border-gray-200 bg-white md:hidden">
    <div class="space-y-1 px-6 py-4">
      <a href="#features" class="block py-2 text-gray-600">Features</a>
      <a href="#pricing" class="block py-2 text-gray-600">Pricing</a>
      <a href="#about" class="block py-2 text-gray-600">About</a>
      <a href="#" class="mt-4 block rounded-lg bg-gray-900 py-3 text-center font-medium text-white">Get Started</a>
    </div>
  </div>
</nav>`,
  },
  {
    id: "footer-minimal",
    type: "footer",
    label: "Minimal",
    bestFor: "",
    html: `<footer class="bg-gray-900 py-12">
  <div class="mx-auto max-w-7xl px-6">
    <div class="flex flex-col items-center justify-between gap-6 md:flex-row">
      <p class="text-sm text-gray-400">© 2025 Brand. All rights reserved.</p>
      <div class="flex gap-6">
        <a href="#" class="text-sm text-gray-400 transition hover:text-white">Privacy</a>
        <a href="#" class="text-sm text-gray-400 transition hover:text-white">Terms</a>
        <a href="#" class="text-sm text-gray-400 transition hover:text-white">Contact</a>
      </div>
      <div class="flex gap-4">
        <a href="#" class="text-gray-400 transition hover:text-white">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
        </a>
        <a href="#" class="text-gray-400 transition hover:text-white">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
        </a>
      </div>
    </div>
  </div>
</footer>`,
  },
  {
    id: "services-cards-for-consultants",
    type: "services",
    label: "Cards for Consultants",
    bestFor: "",
    html: `<section class="bg-white py-24">
  <div class="mx-auto max-w-7xl px-6">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900">How I Can Help</h2>
      <p class="mt-4 text-lg text-gray-600">Tailored solutions for your unique challenges</p>
    </div>
    <div class="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div class="group rounded-2xl border-2 border-gray-100 p-8 transition hover:border-amber-200 hover:bg-amber-50/50">
        <div class="text-4xl">🎯</div>
        <h3 class="mt-6 text-xl font-bold text-gray-900">Strategic Planning</h3>
        <p class="mt-3 text-gray-600">Get clarity on your vision and a roadmap to achieve it. Perfect for founders at a crossroads.</p>
        <p class="mt-6 font-semibold text-amber-600">From $2,500</p>
      </div>
      <div class="group rounded-2xl border-2 border-gray-100 p-8 transition hover:border-amber-200 hover:bg-amber-50/50">
        <div class="text-4xl">🚀</div>
        <h3 class="mt-6 text-xl font-bold text-gray-900">Growth Coaching</h3>
        <p class="mt-3 text-gray-600">Ongoing 1:1 coaching to accelerate your leadership journey. Weekly or bi-weekly sessions.</p>
        <p class="mt-6 font-semibold text-amber-600">$500/month</p>
      </div>
      <div class="group rounded-2xl border-2 border-gray-100 p-8 transition hover:border-amber-200 hover:bg-amber-50/50">
        <div class="text-4xl">👥</div>
        <h3 class="mt-6 text-xl font-bold text-gray-900">Team Workshops</h3>
        <p class="mt-3 text-gray-600">Half-day or full-day sessions to align your team and unlock their potential.</p>
        <p class="mt-6 font-semibold text-amber-600">From $5,000</p>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "about-personal-bio-section",
    type: "about",
    label: "Personal Bio Section",
    bestFor: "",
    html: `<section class="bg-stone-50 py-24">
  <div class="mx-auto max-w-4xl px-6">
    <div class="md:flex md:items-start md:gap-12">
      <div class="md:w-1/3">
        <div class="aspect-square overflow-hidden rounded-2xl bg-stone-200">
          <!-- Placeholder for photo - using initials -->
          <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-6xl font-bold text-white">JD</div>
        </div>
      </div>
      <div class="mt-8 md:mt-0 md:w-2/3">
        <h2 class="text-3xl font-bold text-stone-900">About Me</h2>
        <p class="mt-6 text-lg leading-relaxed text-stone-700">
          I'm a former VP of Engineering turned executive coach. After 15 years building and leading engineering teams at companies like Stripe and Figma, I now help founders and leaders navigate the challenges I once faced.
        </p>
        <p class="mt-4 text-lg leading-relaxed text-stone-700">
          My approach combines practical business strategy with genuine human connection. I believe great leadership isn't about having all the answers—it's about asking the right questions.
        </p>
        <div class="mt-8 flex flex-wrap gap-4">
          <span class="rounded-full bg-stone-200 px-4 py-2 text-sm font-medium text-stone-700">Leadership</span>
          <span class="rounded-full bg-stone-200 px-4 py-2 text-sm font-medium text-stone-700">Team Building</span>
          <span class="rounded-full bg-stone-200 px-4 py-2 text-sm font-medium text-stone-700">Strategy</span>
          <span class="rounded-full bg-stone-200 px-4 py-2 text-sm font-medium text-stone-700">Scaling</span>
        </div>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "stats-metrics-grid",
    type: "stats",
    label: "Metrics Grid",
    bestFor: "",
    html: `<section class="bg-white py-16">
  <div class="mx-auto max-w-7xl px-6">
    <div class="grid grid-cols-2 gap-8 lg:grid-cols-4">
      <div class="text-center">
        <p class="text-4xl font-bold text-gray-900 lg:text-5xl">10K+</p>
        <p class="mt-2 text-gray-600">Active Users</p>
      </div>
      <div class="text-center">
        <p class="text-4xl font-bold text-gray-900 lg:text-5xl">99.9%</p>
        <p class="mt-2 text-gray-600">Uptime</p>
      </div>
      <div class="text-center">
        <p class="text-4xl font-bold text-gray-900 lg:text-5xl">150+</p>
        <p class="mt-2 text-gray-600">Countries</p>
      </div>
      <div class="text-center">
        <p class="text-4xl font-bold text-gray-900 lg:text-5xl">4.9★</p>
        <p class="mt-2 text-gray-600">Average Rating</p>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "logos-trust-bar",
    type: "logos",
    label: "Trust Bar",
    bestFor: "",
    html: `<section class="bg-gray-50 py-12">
  <div class="mx-auto max-w-7xl px-6">
    <p class="text-center text-sm font-medium uppercase tracking-widest text-gray-500">Trusted by innovative teams</p>
    <div class="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
      <div class="flex h-8 w-24 items-center justify-center rounded bg-gray-300 text-xs font-bold text-gray-600">LOGO</div>
      <div class="flex h-8 w-24 items-center justify-center rounded bg-gray-300 text-xs font-bold text-gray-600">LOGO</div>
      <div class="flex h-8 w-24 items-center justify-center rounded bg-gray-300 text-xs font-bold text-gray-600">LOGO</div>
      <div class="flex h-8 w-24 items-center justify-center rounded bg-gray-300 text-xs font-bold text-gray-600">LOGO</div>
      <div class="flex h-8 w-24 items-center justify-center rounded bg-gray-300 text-xs font-bold text-gray-600">LOGO</div>
    </div>
  </div>
</section>`,
  },
  {
    id: "faq-accordion",
    type: "faq",
    label: "Accordion",
    bestFor: "",
    html: `<section class="bg-white py-24">
  <div class="mx-auto max-w-3xl px-6">
    <h2 class="text-center text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
    <div class="mt-12 space-y-4" x-data="{ open: null }">
      <div class="rounded-lg border border-gray-200">
        <button @click="open = open === 1 ? null : 1" class="flex w-full items-center justify-between px-6 py-4 text-left">
          <span class="font-medium text-gray-900">How do I get started?</span>
          <svg class="h-5 w-5 text-gray-500 transition-transform" :class="{ 'rotate-180': open === 1 }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
        <div x-show="open === 1" x-collapse class="px-6 pb-4 text-gray-600">
          Getting started is easy. Simply sign up for a free account and follow our quick setup wizard. You'll be up and running in under 5 minutes.
        </div>
      </div>
      <div class="rounded-lg border border-gray-200">
        <button @click="open = open === 2 ? null : 2" class="flex w-full items-center justify-between px-6 py-4 text-left">
          <span class="font-medium text-gray-900">What payment methods do you accept?</span>
          <svg class="h-5 w-5 text-gray-500 transition-transform" :class="{ 'rotate-180': open === 2 }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
        <div x-show="open === 2" x-collapse class="px-6 pb-4 text-gray-600">
          We accept all major credit cards, PayPal, and bank transfers for annual plans. All payments are processed securely.
        </div>
      </div>
      <div class="rounded-lg border border-gray-200">
        <button @click="open = open === 3 ? null : 3" class="flex w-full items-center justify-between px-6 py-4 text-left">
          <span class="font-medium text-gray-900">Can I cancel anytime?</span>
          <svg class="h-5 w-5 text-gray-500 transition-transform" :class="{ 'rotate-180': open === 3 }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
        <div x-show="open === 3" x-collapse class="px-6 pb-4 text-gray-600">
          Yes, you can cancel your subscription at any time. No questions asked, no hidden fees.
        </div>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "team-grid-with-cards",
    type: "team",
    label: "Grid with Cards",
    bestFor: "",
    html: `<section class="bg-gray-50 py-24">
  <div class="mx-auto max-w-7xl px-6">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900">Meet the Team</h2>
      <p class="mt-4 text-lg text-gray-600">The people behind the product</p>
    </div>
    <div class="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <div class="text-center">
        <div class="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white">JD</div>
        <h3 class="mt-6 text-lg font-semibold text-gray-900">Jane Doe</h3>
        <p class="text-gray-600">CEO & Founder</p>
      </div>
      <div class="text-center">
        <div class="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-3xl font-bold text-white">MS</div>
        <h3 class="mt-6 text-lg font-semibold text-gray-900">Mike Smith</h3>
        <p class="text-gray-600">CTO</p>
      </div>
      <div class="text-center">
        <div class="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-3xl font-bold text-white">AJ</div>
        <h3 class="mt-6 text-lg font-semibold text-gray-900">Alex Johnson</h3>
        <p class="text-gray-600">Head of Design</p>
      </div>
      <div class="text-center">
        <div class="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-3xl font-bold text-white">SW</div>
        <h3 class="mt-6 text-lg font-semibold text-gray-900">Sarah Williams</h3>
        <p class="text-gray-600">Lead Engineer</p>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "process-timeline-steps",
    type: "process",
    label: "Timeline Steps",
    bestFor: "",
    html: `<section class="bg-white py-24">
  <div class="mx-auto max-w-4xl px-6">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900">How It Works</h2>
      <p class="mt-4 text-lg text-gray-600">Three simple steps to get started</p>
    </div>
    <div class="mt-16 space-y-12">
      <div class="flex gap-6">
        <div class="flex flex-col items-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">1</div>
          <div class="mt-4 h-full w-0.5 bg-indigo-200"></div>
        </div>
        <div class="pb-12">
          <h3 class="text-xl font-semibold text-gray-900">Sign Up</h3>
          <p class="mt-2 text-gray-600">Create your free account in seconds. No credit card required.</p>
        </div>
      </div>
      <div class="flex gap-6">
        <div class="flex flex-col items-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">2</div>
          <div class="mt-4 h-full w-0.5 bg-indigo-200"></div>
        </div>
        <div class="pb-12">
          <h3 class="text-xl font-semibold text-gray-900">Configure</h3>
          <p class="mt-2 text-gray-600">Set up your preferences and connect your existing tools.</p>
        </div>
      </div>
      <div class="flex gap-6">
        <div class="flex flex-col items-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">3</div>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-900">Launch</h3>
          <p class="mt-2 text-gray-600">Go live and start seeing results immediately.</p>
        </div>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "bento-asymmetric-grid",
    type: "bento",
    label: "Asymmetric Grid",
    bestFor: "",
    html: `<section class="bg-gray-50 py-24">
  <div class="mx-auto max-w-7xl px-6">
    <h2 class="text-3xl font-bold text-gray-900">Everything in one place</h2>
    <div class="mt-12 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
      <div class="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white lg:row-span-2">
        <h3 class="text-2xl font-bold">Analytics</h3>
        <p class="mt-4 text-indigo-100">Deep insights into your performance with real-time dashboards and custom reports.</p>
        <img src="https://illustrations.popsy.co/white/developer-activity.svg" alt="Analytics" class="mt-8 w-full">
      </div>
      <div class="rounded-2xl bg-white p-8 shadow-sm lg:col-span-2">
        <h3 class="text-xl font-bold text-gray-900">Collaboration</h3>
        <p class="mt-2 text-gray-600">Work together seamlessly with your team. Real-time editing, comments, and version history.</p>
      </div>
      <div class="rounded-2xl bg-gray-900 p-8 text-white">
        <h3 class="text-xl font-bold">Security</h3>
        <p class="mt-2 text-gray-400">Enterprise-grade encryption and compliance built-in.</p>
      </div>
      <div class="rounded-2xl bg-amber-100 p-8">
        <h3 class="text-xl font-bold text-amber-900">Integrations</h3>
        <p class="mt-2 text-amber-800">Connect with 100+ tools you already use.</p>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "hero-gradient-mesh-background",
    type: "hero",
    label: "Gradient Mesh Background",
    bestFor: "",
    html: `<section class="relative min-h-screen overflow-hidden bg-slate-950">
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl"></div>
    <div class="absolute -right-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl"></div>
    <div class="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"></div>
  </div>
  <div class="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
    <h1 class="text-5xl font-bold tracking-tight text-white md:text-7xl">
      Build the future,<br><span class="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">one pixel at a time</span>
    </h1>
    <p class="mt-8 max-w-2xl text-xl text-slate-300">
      The design platform that brings your wildest ideas to life. No compromises, no limits.
    </p>
    <div class="mt-12 flex flex-col gap-4 sm:flex-row">
      <a href="#" class="rounded-full bg-white px-8 py-4 font-semibold text-slate-900 transition hover:bg-slate-100">Start Creating</a>
      <a href="#" class="rounded-full border border-slate-600 px-8 py-4 font-semibold text-white transition hover:border-slate-400">Watch Demo</a>
    </div>
  </div>
</section>`,
  },
  {
    id: "hero-asymmetric-split-with-shapes",
    type: "hero",
    label: "Asymmetric Split with Shapes",
    bestFor: "",
    html: `<section class="bg-orange-50 py-24 lg:py-0 lg:min-h-screen">
  <div class="mx-auto max-w-7xl lg:flex lg:items-center">
    <div class="px-6 lg:w-1/2 lg:py-24">
      <span class="inline-block rounded-full bg-orange-200 px-4 py-1 text-sm font-medium text-orange-800">New Release</span>
      <h1 class="mt-6 text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
        Design that speaks volumes
      </h1>
      <p class="mt-6 text-lg text-gray-600">
        Create stunning visual experiences that captivate your audience and drive results.
      </p>
      <a href="#" class="mt-8 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700">
        Get Started
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
      </a>
    </div>
    <div class="relative mt-12 lg:mt-0 lg:w-1/2">
      <div class="absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-300/50"></div>
      <div class="absolute bottom-12 right-24 h-32 w-32 rounded-2xl bg-orange-400/60 rotate-12"></div>
      <div class="absolute right-12 top-1/2 h-48 w-48 rounded-3xl bg-orange-200/80 -rotate-6"></div>
      <div class="absolute bottom-0 right-48 h-24 w-24 rounded-full bg-orange-500/40"></div>
    </div>
  </div>
</section>`,
  },
  {
    id: "gallery-portfolio-grid",
    type: "gallery",
    label: "Portfolio Grid",
    bestFor: "",
    html: `<section class="bg-white py-24">
  <div class="mx-auto max-w-7xl px-6">
    <h2 class="text-3xl font-bold text-gray-900">Our Work</h2>
    <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="group relative aspect-square overflow-hidden rounded-2xl bg-gray-200">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700"></div>
        <div class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/60">
          <div class="text-center text-white">
            <p class="text-xl font-bold">Project Alpha</p>
            <p class="mt-2 text-sm text-gray-300">Brand Identity</p>
          </div>
        </div>
      </div>
      <div class="group relative aspect-square overflow-hidden rounded-2xl bg-gray-200">
        <div class="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700"></div>
        <div class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/60">
          <div class="text-center text-white">
            <p class="text-xl font-bold">EcoTech</p>
            <p class="mt-2 text-sm text-gray-300">Web Design</p>
          </div>
        </div>
      </div>
      <div class="group relative aspect-square overflow-hidden rounded-2xl bg-gray-200">
        <div class="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600"></div>
        <div class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/60">
          <div class="text-center text-white">
            <p class="text-xl font-bold">Sunrise App</p>
            <p class="mt-2 text-sm text-gray-300">Mobile App</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "contact-simple-info-display",
    type: "contact",
    label: "Simple Info Display",
    bestFor: "",
    html: `<section class="bg-gray-50 py-24">
  <div class="mx-auto max-w-4xl px-6">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900">Get in Touch</h2>
      <p class="mt-4 text-lg text-gray-600">We'd love to hear from you</p>
    </div>
    <div class="mt-12 grid gap-8 sm:grid-cols-3">
      <div class="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        </div>
        <h3 class="mt-4 font-semibold text-gray-900">Email</h3>
        <p class="mt-2 text-gray-600">hello@example.com</p>
      </div>
      <div class="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
        </div>
        <h3 class="mt-4 font-semibold text-gray-900">Phone</h3>
        <p class="mt-2 text-gray-600">+1 (555) 123-4567</p>
      </div>
      <div class="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </div>
        <h3 class="mt-4 font-semibold text-gray-900">Address</h3>
        <p class="mt-2 text-gray-600">123 Main St, City</p>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "cta-with-stats",
    type: "cta",
    label: "With Stats",
    bestFor: "",
    html: `<section class="bg-gradient-to-r from-indigo-600 to-purple-700 py-24">
  <div class="mx-auto max-w-7xl px-6">
    <div class="lg:flex lg:items-center lg:justify-between">
      <div>
        <h2 class="text-3xl font-bold text-white md:text-4xl">Ready to transform your workflow?</h2>
        <div class="mt-8 flex gap-12">
          <div>
            <p class="text-4xl font-bold text-white">50K+</p>
            <p class="text-indigo-200">Happy customers</p>
          </div>
          <div>
            <p class="text-4xl font-bold text-white">99%</p>
            <p class="text-indigo-200">Satisfaction rate</p>
          </div>
          <div>
            <p class="text-4xl font-bold text-white">24/7</p>
            <p class="text-indigo-200">Support available</p>
          </div>
        </div>
      </div>
      <div class="mt-10 lg:mt-0">
        <a href="#" class="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-indigo-600 transition hover:bg-indigo-50">
          Start Free Trial
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </a>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "testimonials-large-quote",
    type: "testimonials",
    label: "Large Quote",
    bestFor: "",
    html: `<section class="bg-white py-24">
  <div class="mx-auto max-w-4xl px-6 text-center">
    <svg class="mx-auto h-12 w-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
    <blockquote class="mt-8 text-2xl font-medium leading-relaxed text-gray-900 md:text-3xl">
      "This product completely transformed how we work. What used to take us weeks now takes hours. I can't imagine going back to the old way."
    </blockquote>
    <div class="mt-8">
      <p class="font-semibold text-gray-900">Amanda Richardson</p>
      <p class="text-gray-600">VP of Operations, TechCorp</p>
    </div>
  </div>
</section>`,
  },
  {
    id: "footer-multi-column",
    type: "footer",
    label: "Multi-column",
    bestFor: "",
    html: `<footer class="bg-gray-900 py-16">
  <div class="mx-auto max-w-7xl px-6">
    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      <div>
        <p class="text-xl font-bold text-white">Brand</p>
        <p class="mt-4 text-gray-400">Building the future of digital experiences, one pixel at a time.</p>
      </div>
      <div>
        <p class="font-semibold text-white">Product</p>
        <ul class="mt-4 space-y-2">
          <li><a href="#" class="text-gray-400 transition hover:text-white">Features</a></li>
          <li><a href="#" class="text-gray-400 transition hover:text-white">Pricing</a></li>
          <li><a href="#" class="text-gray-400 transition hover:text-white">Integrations</a></li>
          <li><a href="#" class="text-gray-400 transition hover:text-white">Changelog</a></li>
        </ul>
      </div>
      <div>
        <p class="font-semibold text-white">Company</p>
        <ul class="mt-4 space-y-2">
          <li><a href="#" class="text-gray-400 transition hover:text-white">About</a></li>
          <li><a href="#" class="text-gray-400 transition hover:text-white">Blog</a></li>
          <li><a href="#" class="text-gray-400 transition hover:text-white">Careers</a></li>
          <li><a href="#" class="text-gray-400 transition hover:text-white">Contact</a></li>
        </ul>
      </div>
      <div>
        <p class="font-semibold text-white">Legal</p>
        <ul class="mt-4 space-y-2">
          <li><a href="#" class="text-gray-400 transition hover:text-white">Privacy</a></li>
          <li><a href="#" class="text-gray-400 transition hover:text-white">Terms</a></li>
          <li><a href="#" class="text-gray-400 transition hover:text-white">Security</a></li>
        </ul>
      </div>
    </div>
    <div class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 md:flex-row">
      <p class="text-sm text-gray-400">© 2025 Brand. All rights reserved.</p>
      <div class="flex gap-4">
        <a href="#" class="text-gray-400 transition hover:text-white">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
        </a>
        <a href="#" class="text-gray-400 transition hover:text-white">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
        </a>
        <a href="#" class="text-gray-400 transition hover:text-white">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
      </div>
    </div>
  </div>
</footer>`,
  },
  {
    id: "hero-event-countdown",
    type: "hero",
    label: "Event Countdown with Date",
    bestFor: "Events/Parties/Conferences",
    html: `<section class="relative overflow-hidden bg-gradient-to-br from-violet-950 via-fuchsia-900 to-rose-900 py-32">
  <div class="absolute inset-0">
    <div class="absolute left-1/4 top-1/3 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl"></div>
    <div class="absolute right-1/4 bottom-1/4 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl"></div>
  </div>
  <div class="relative mx-auto max-w-5xl px-6 text-center">
    <p class="inline-block rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-5 py-2 text-sm font-semibold uppercase tracking-widest text-fuchsia-300">You're Invited</p>
    <h1 class="mt-8 text-5xl font-extrabold tracking-tight text-white md:text-8xl">
      The Big<br><span class="bg-gradient-to-r from-amber-300 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Game Day</span>
    </h1>
    <p class="mx-auto mt-6 max-w-xl text-xl text-fuchsia-100/80">Kickoff, food, friends, and the best halftime show of the decade. Don't miss it.</p>
    <div class="mt-12 flex items-center justify-center gap-6">
      <div class="rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-sm">
        <p class="text-3xl font-bold text-white">FEB</p>
        <p class="text-5xl font-extrabold text-amber-300">8</p>
      </div>
      <div class="text-left">
        <p class="text-lg font-semibold text-white">Sunday, 2026</p>
        <p class="text-fuchsia-200">Doors open at 3:00 PM</p>
        <p class="text-fuchsia-200">123 Main Street, Seattle</p>
      </div>
    </div>
    <div class="mt-10">
      <a href="#rsvp" class="inline-flex items-center gap-2 rounded-full bg-amber-400 px-8 py-4 text-lg font-bold text-amber-950 transition hover:bg-amber-300 hover:scale-105">
        RSVP Now
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
      </a>
    </div>
  </div>
</section>`,
  },
  {
    id: "hero-brutalist-bold",
    type: "hero",
    label: "Brutalist Bold Typography",
    bestFor: "Creative Agencies/Bold Brands",
    html: `<section class="bg-lime-300 py-24">
  <div class="mx-auto max-w-7xl px-6">
    <div class="border-b-4 border-black pb-8">
      <p class="font-mono text-sm uppercase tracking-widest text-black/60">Est. 2024 — Creative Studio</p>
    </div>
    <h1 class="mt-12 text-6xl font-black uppercase leading-none text-black md:text-9xl">
      We make<br>
      <span class="inline-block -rotate-2 bg-black px-4 text-lime-300">wild</span><br>
      things happen
    </h1>
    <div class="mt-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <p class="max-w-md text-xl leading-relaxed text-black/70">
        Branding, campaigns, and digital experiences for companies that refuse to blend in.
      </p>
      <a href="#work" class="group inline-flex items-center gap-3 border-2 border-black px-8 py-4 font-mono text-lg font-bold uppercase text-black transition hover:bg-black hover:text-lime-300">
        See our work
        <svg class="h-5 w-5 transition group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
      </a>
    </div>
  </div>
</section>`,
  },
  {
    id: "schedule-event-timeline",
    type: "schedule",
    label: "Event Timeline with Blocks",
    bestFor: "Events/Watch Parties/Conferences",
    html: `<section class="bg-zinc-950 py-24">
  <div class="mx-auto max-w-4xl px-6">
    <h2 class="text-center text-3xl font-bold text-white">Game Day Schedule</h2>
    <p class="mt-4 text-center text-lg text-zinc-400">Here's how the day breaks down</p>
    <div class="mt-16 space-y-6">
      <div class="flex gap-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-amber-500/50">
        <div class="flex-shrink-0 text-center">
          <p class="text-2xl font-bold text-amber-400">3:00</p>
          <p class="text-sm text-zinc-500">PM</p>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white">Doors Open</h3>
          <p class="mt-1 text-zinc-400">Arrive early, grab a drink, claim your spot on the couch.</p>
        </div>
      </div>
      <div class="flex gap-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-emerald-500/50">
        <div class="flex-shrink-0 text-center">
          <p class="text-2xl font-bold text-emerald-400">4:30</p>
          <p class="text-sm text-zinc-500">PM</p>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white">Food & Drinks Ready</h3>
          <p class="mt-1 text-zinc-400">Wings, sliders, nachos, and cold ones on tap.</p>
        </div>
      </div>
      <div class="flex gap-6 rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 to-fuchsia-950/30 p-6 transition hover:border-fuchsia-500/50 border border-zinc-800">
        <div class="flex-shrink-0 text-center">
          <p class="text-2xl font-bold text-fuchsia-400">Half</p>
          <p class="text-sm text-zinc-500">time</p>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white">Halftime Show 🎤</h3>
          <p class="mt-1 text-zinc-400">The main event within the main event. Volume goes UP.</p>
        </div>
      </div>
      <div class="flex gap-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-blue-500/50">
        <div class="flex-shrink-0 text-center">
          <p class="text-2xl font-bold text-blue-400">Post</p>
          <p class="text-sm text-zinc-500">game</p>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white">Celebration (or Commiseration)</h3>
          <p class="mt-1 text-zinc-400">Either way, we're finishing the nachos.</p>
        </div>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "features-playful-emoji-cards",
    type: "features",
    label: "Playful Cards with Emoji Icons",
    bestFor: "Fun/Casual/Events",
    html: `<section class="bg-amber-50 py-24">
  <div class="mx-auto max-w-7xl px-6">
    <h2 class="text-center text-4xl font-extrabold text-gray-900">What to Expect</h2>
    <p class="mt-4 text-center text-lg text-gray-600">Everything you need for a perfect day</p>
    <div class="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <div class="text-5xl">🍕</div>
        <h3 class="mt-4 text-lg font-bold text-gray-900">Epic Food Spread</h3>
        <p class="mt-2 text-gray-600">From wings to nachos to a dessert table that won't quit.</p>
      </div>
      <div class="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <div class="text-5xl">📺</div>
        <h3 class="mt-4 text-lg font-bold text-gray-900">Big Screen Setup</h3>
        <p class="mt-2 text-gray-600">85-inch display with surround sound. Better than being there.</p>
      </div>
      <div class="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <div class="text-5xl">🎲</div>
        <h3 class="mt-4 text-lg font-bold text-gray-900">Prop Bets & Games</h3>
        <p class="mt-2 text-gray-600">Squares board, prediction cards, and halftime trivia.</p>
      </div>
      <div class="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <div class="text-5xl">🏆</div>
        <h3 class="mt-4 text-lg font-bold text-gray-900">Prizes</h3>
        <p class="mt-2 text-gray-600">Best dressed, best dip, and squares winner take home glory.</p>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "cta-rsvp-bold",
    type: "cta",
    label: "Bold RSVP with Details",
    bestFor: "Events/Parties/Invitations",
    html: `<section class="bg-gradient-to-br from-emerald-600 to-teal-700 py-24">
  <div class="mx-auto max-w-3xl px-6 text-center">
    <p class="text-6xl">🏈</p>
    <h2 class="mt-6 text-4xl font-extrabold text-white md:text-5xl">Don't Just Watch.<br>Watch With Us.</h2>
    <p class="mt-6 text-xl text-emerald-100">Space is limited. Snacks are not. Lock in your spot before it's gone.</p>
    <div class="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <a href="#" class="rounded-full bg-white px-10 py-4 text-lg font-bold text-emerald-700 transition hover:bg-emerald-50 hover:scale-105">
        Count Me In
      </a>
      <a href="#" class="rounded-full border-2 border-white/50 px-10 py-4 text-lg font-semibold text-white transition hover:border-white hover:bg-white/10">
        Maybe / +1
      </a>
    </div>
    <div class="mt-12 grid grid-cols-3 gap-4 text-center">
      <div>
        <p class="text-3xl font-bold text-white">24</p>
        <p class="text-sm text-emerald-200">Spots Left</p>
      </div>
      <div>
        <p class="text-3xl font-bold text-white">18</p>
        <p class="text-sm text-emerald-200">Confirmed</p>
      </div>
      <div>
        <p class="text-3xl font-bold text-white">BYOB</p>
        <p class="text-sm text-emerald-200">Bring Your Own</p>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "menu-food-drink-grid",
    type: "menu",
    label: "Food & Drink Grid",
    bestFor: "Restaurants/Cafes/Events",
    html: `<section class="bg-stone-50 py-24">
  <div class="mx-auto max-w-5xl px-6">
    <h2 class="text-center font-serif text-4xl font-bold text-stone-900">The Menu</h2>
    <p class="mt-4 text-center text-lg text-stone-500">Made with love, served with style</p>
    <div class="mt-16 grid gap-12 md:grid-cols-2">
      <div>
        <h3 class="border-b-2 border-stone-900 pb-2 text-xl font-bold uppercase tracking-wider text-stone-900">Mains</h3>
        <div class="mt-6 space-y-6">
          <div class="flex items-baseline justify-between gap-4">
            <div>
              <p class="font-semibold text-stone-900">Smoked Brisket Sliders</p>
              <p class="text-sm text-stone-500">12-hour smoked, pickled slaw, brioche buns</p>
            </div>
            <p class="flex-shrink-0 font-mono text-stone-600">$14</p>
          </div>
          <div class="flex items-baseline justify-between gap-4">
            <div>
              <p class="font-semibold text-stone-900">Truffle Mushroom Flatbread</p>
              <p class="text-sm text-stone-500">Wild mushrooms, gruyère, arugula, truffle oil</p>
            </div>
            <p class="flex-shrink-0 font-mono text-stone-600">$16</p>
          </div>
          <div class="flex items-baseline justify-between gap-4">
            <div>
              <p class="font-semibold text-stone-900">Crispy Fish Tacos</p>
              <p class="text-sm text-stone-500">Beer-battered cod, mango salsa, chipotle crema</p>
            </div>
            <p class="flex-shrink-0 font-mono text-stone-600">$13</p>
          </div>
        </div>
      </div>
      <div>
        <h3 class="border-b-2 border-stone-900 pb-2 text-xl font-bold uppercase tracking-wider text-stone-900">Drinks</h3>
        <div class="mt-6 space-y-6">
          <div class="flex items-baseline justify-between gap-4">
            <div>
              <p class="font-semibold text-stone-900">House Old Fashioned</p>
              <p class="text-sm text-stone-500">Bourbon, demerara, angostura, orange peel</p>
            </div>
            <p class="flex-shrink-0 font-mono text-stone-600">$12</p>
          </div>
          <div class="flex items-baseline justify-between gap-4">
            <div>
              <p class="font-semibold text-stone-900">Spicy Margarita</p>
              <p class="text-sm text-stone-500">Tequila, lime, jalapeño, agave, tajín rim</p>
            </div>
            <p class="flex-shrink-0 font-mono text-stone-600">$11</p>
          </div>
          <div class="flex items-baseline justify-between gap-4">
            <div>
              <p class="font-semibold text-stone-900">Local IPA Draft</p>
              <p class="text-sm text-stone-500">Rotating selection from regional breweries</p>
            </div>
            <p class="flex-shrink-0 font-mono text-stone-600">$8</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "navbar-dark-transparent",
    type: "navbar",
    label: "Dark Transparent with Accent",
    bestFor: "Events/Bold Brands/Nightlife",
    html: `<nav class="fixed top-0 z-50 w-full bg-black/60 backdrop-blur-xl border-b border-white/10" x-data="{ open: false }">
  <div class="mx-auto max-w-7xl px-6">
    <div class="flex h-16 items-center justify-between">
      <a href="/" class="flex items-center gap-2">
        <span class="text-2xl">🏈</span>
        <span class="text-lg font-bold text-white">SB Watch Party</span>
      </a>
      <div class="hidden items-center gap-8 md:flex">
        <a href="#schedule" class="text-sm text-white/70 transition hover:text-white">Schedule</a>
        <a href="#menu" class="text-sm text-white/70 transition hover:text-white">Food & Drinks</a>
        <a href="#location" class="text-sm text-white/70 transition hover:text-white">Location</a>
        <a href="#rsvp" class="rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-amber-950 transition hover:bg-amber-300">RSVP</a>
      </div>
      <button @click="open = !open" class="text-white md:hidden">
        <svg x-show="!open" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        <svg x-show="open" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  </div>
  <div x-show="open" x-transition class="border-t border-white/10 bg-black/90 md:hidden">
    <div class="space-y-1 px-6 py-4">
      <a href="#schedule" class="block py-2 text-white/70">Schedule</a>
      <a href="#menu" class="block py-2 text-white/70">Food & Drinks</a>
      <a href="#location" class="block py-2 text-white/70">Location</a>
      <a href="#rsvp" class="mt-4 block rounded-full bg-amber-400 py-3 text-center font-bold text-amber-950">RSVP</a>
    </div>
  </div>
</nav>`,
  },
  {
    id: "hero-warm-organic",
    type: "hero",
    label: "Warm Organic with Soft Shapes",
    bestFor: "Wellness/Food/Lifestyle",
    html: `<section class="relative overflow-hidden bg-orange-50 py-32">
  <div class="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-200/50" style="border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;"></div>
  <div class="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-rose-200/40" style="border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;"></div>
  <div class="relative mx-auto max-w-4xl px-6 text-center">
    <p class="font-serif text-lg italic text-orange-600">Nourish your body, feed your soul</p>
    <h1 class="mt-6 font-serif text-5xl font-bold leading-tight text-stone-900 md:text-7xl">
      Handcrafted with<br>
      <span class="text-orange-600">real ingredients</span>
    </h1>
    <p class="mx-auto mt-8 max-w-xl text-xl leading-relaxed text-stone-600">
      From our kitchen to your table — seasonal menus, locally sourced, and made fresh every morning.
    </p>
    <div class="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <a href="#menu" class="rounded-full bg-stone-900 px-8 py-4 font-semibold text-white transition hover:bg-stone-800">
        See Today's Menu
      </a>
      <a href="#story" class="rounded-full border-2 border-stone-300 px-8 py-4 font-semibold text-stone-700 transition hover:border-stone-900">
        Our Story
      </a>
    </div>
  </div>
</section>`,
  },
  {
    id: "features-numbered-steps-horizontal",
    type: "features",
    label: "Numbered Horizontal Steps",
    bestFor: "Onboarding/How-it-works",
    html: `<section class="bg-white py-24">
  <div class="mx-auto max-w-7xl px-6">
    <h2 class="text-3xl font-bold text-gray-900">How It Works</h2>
    <p class="mt-4 text-lg text-gray-500">Three steps. Zero friction.</p>
    <div class="mt-16 grid gap-12 md:grid-cols-3">
      <div class="relative">
        <span class="absolute -top-6 font-mono text-8xl font-black text-gray-100">01</span>
        <div class="relative pt-8">
          <div class="h-1 w-12 rounded bg-indigo-500"></div>
          <h3 class="mt-4 text-xl font-bold text-gray-900">Describe your vision</h3>
          <p class="mt-3 text-gray-600">Tell us what you're building in plain English. No templates, no forms — just your idea.</p>
        </div>
      </div>
      <div class="relative">
        <span class="absolute -top-6 font-mono text-8xl font-black text-gray-100">02</span>
        <div class="relative pt-8">
          <div class="h-1 w-12 rounded bg-indigo-500"></div>
          <h3 class="mt-4 text-xl font-bold text-gray-900">Watch it come to life</h3>
          <p class="mt-3 text-gray-600">Our AI crafts a unique design in real-time. Review, refine, and iterate instantly.</p>
        </div>
      </div>
      <div class="relative">
        <span class="absolute -top-6 font-mono text-8xl font-black text-gray-100">03</span>
        <div class="relative pt-8">
          <div class="h-1 w-12 rounded bg-indigo-500"></div>
          <h3 class="mt-4 text-xl font-bold text-gray-900">Ship it</h3>
          <p class="mt-3 text-gray-600">One click to publish. Custom domain, SSL, and analytics included. You're live.</p>
        </div>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "contact-map-and-form",
    type: "contact",
    label: "Split Form with Location Details",
    bestFor: "Local Businesses/Events",
    html: `<section class="bg-white py-24">
  <div class="mx-auto max-w-7xl px-6">
    <div class="lg:flex lg:gap-16">
      <div class="lg:w-1/2">
        <h2 class="text-3xl font-bold text-gray-900">Find Us</h2>
        <p class="mt-4 text-lg text-gray-600">Come say hi — we'd love to meet you in person.</p>
        <div class="mt-8 space-y-6">
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900">Address</p>
              <p class="text-gray-600">123 Pike Place, Seattle, WA 98101</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900">Hours</p>
              <p class="text-gray-600">Mon–Fri: 7am – 9pm</p>
              <p class="text-gray-600">Sat–Sun: 8am – 10pm</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900">Phone</p>
              <p class="text-gray-600">(206) 555-0142</p>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-12 lg:mt-0 lg:w-1/2">
        <form class="rounded-2xl bg-gray-50 p-8">
          <h3 class="text-xl font-semibold text-gray-900">Send a Message</h3>
          <div class="mt-6 space-y-4">
            <input type="text" placeholder="Your Name" class="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <input type="email" placeholder="Email Address" class="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <textarea rows="4" placeholder="Your message..." class="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"></textarea>
            <button type="submit" class="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700">Send Message</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "footer-colorful-stacked",
    type: "footer",
    label: "Colorful Stacked with Social",
    bestFor: "Events/Creative/Fun Brands",
    html: `<footer class="bg-gradient-to-b from-fuchsia-950 to-black py-16">
  <div class="mx-auto max-w-4xl px-6 text-center">
    <p class="text-4xl">🎉</p>
    <p class="mt-4 text-2xl font-bold text-white">See you on game day!</p>
    <p class="mt-2 text-fuchsia-300">February 8, 2026 · Doors at 3 PM</p>
    <div class="mt-8 flex justify-center gap-6">
      <a href="#" class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </a>
      <a href="#" class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
      </a>
    </div>
    <div class="mt-8 border-t border-white/10 pt-8">
      <p class="text-sm text-fuchsia-400/60">Made with ❤️ for the best watch party ever</p>
    </div>
  </div>
</footer>`,
  },
  {
    id: "hero-emoji-minimal",
    type: "hero",
    label: "Giant Emoji Minimal",
    bestFor: "Joke Sites/Meme Pages/Party Invites",
    html: `<section class="flex min-h-screen items-center justify-center bg-gradient-to-b from-yellow-300 to-orange-400">
  <div class="mx-auto max-w-2xl px-6 text-center">
    <p class="text-9xl md:text-[12rem] leading-none">🎉</p>
    <h1 class="mt-6 text-5xl font-black uppercase text-black md:text-7xl">
      YOU'RE INVITED
    </h1>
    <p class="mt-4 text-2xl font-medium text-black/70">
      Saturday, March 15 · 7 PM · Jake's Place
    </p>
    <a href="#rsvp" class="mt-10 inline-block rounded-full bg-black px-12 py-5 text-xl font-bold text-yellow-300 transition hover:scale-110">
      I'M COMING 🙌
    </a>
    <p class="mt-6 text-lg text-black/50">Bring snacks or don't come</p>
  </div>
</section>`,
  },
  {
    id: "hero-single-joke",
    type: "hero",
    label: "Single Purpose Joke Page",
    bestFor: "Meme/Novelty/One-Joke Sites",
    html: `<section class="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
  <h1 class="text-6xl font-black text-white md:text-8xl">
    IS IT<br>
    <span class="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">FRIDAY</span><br>
    YET?
  </h1>
  <div class="mt-12 rounded-3xl bg-zinc-900 px-16 py-10 border border-zinc-800">
    <p class="text-7xl font-black text-red-500 md:text-9xl">NO.</p>
  </div>
  <p class="mt-8 text-xl text-zinc-500">Check back tomorrow.</p>
  <div class="mt-12 flex gap-4">
    <a href="#" class="text-zinc-600 transition hover:text-zinc-400">
      <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
    </a>
  </div>
</section>`,
  },
  {
    id: "cta-simple-fun-rsvp",
    type: "cta",
    label: "One-Button Fun RSVP",
    bestFor: "Casual Events/Parties",
    html: `<section class="bg-pink-500 py-20">
  <div class="mx-auto max-w-lg px-6 text-center">
    <p class="text-6xl">👇</p>
    <h2 class="mt-4 text-3xl font-black text-white">That's It. That's the Whole Site.</h2>
    <p class="mt-4 text-xl text-pink-100">Just tell us you're coming.</p>
    <div class="mt-8 flex flex-col gap-4">
      <a href="#" class="rounded-full bg-white px-8 py-4 text-lg font-bold text-pink-600 transition hover:scale-105 hover:bg-pink-50">
        Yes, I'll Be There 🎉
      </a>
      <a href="#" class="rounded-full border-2 border-white px-8 py-4 text-lg font-bold text-white transition hover:bg-white hover:text-pink-600">
        Maybe (I'm Flaky) 🤷
      </a>
      <p class="mt-2 text-sm text-pink-200">No is not an option</p>
    </div>
  </div>
</section>`,
  },
];

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function selectComponentExamples(
  neededTypes: string[],
  seed?: number,
  perType = 1,
  extraCount = 2,
): ComponentExample[] {
  const rng = mulberry32(seed ?? Date.now());
  const selected: ComponentExample[] = [];
  const usedIds = new Set<string>();

  for (const type of neededTypes) {
    const candidates = COMPONENT_EXAMPLES_LIST.filter(
      (e) => e.type === type && !usedIds.has(e.id),
    );
    if (candidates.length > 0) {
      const shuffled = [...candidates].sort(() => rng() - 0.5);
      for (let i = 0; i < Math.min(perType, shuffled.length); i++) {
        selected.push(shuffled[i]);
        usedIds.add(shuffled[i].id);
      }
    }
  }

  const remaining = COMPONENT_EXAMPLES_LIST.filter((e) => !usedIds.has(e.id));
  const shuffledRemaining = [...remaining].sort(() => rng() - 0.5);
  for (let i = 0; i < Math.min(extraCount, shuffledRemaining.length); i++) {
    selected.push(shuffledRemaining[i]);
    usedIds.add(shuffledRemaining[i].id);
  }

  return selected;
}

export function formatComponentExamples(examples: ComponentExample[]): string {
  const header = `## REFERENCE COMPONENTS

These are a FEW examples of high-quality designs. Study the PRINCIPLES behind them, then create ORIGINAL designs tailored to each project. Do NOT copy these verbatim — they exist only to show the expected level of craft and polish.

IMPORTANT: You will see different examples each time. Do not try to reproduce these specific patterns. Instead, invent new layouts, color combinations, and structural approaches that match the project's unique identity.

---`;

  const fence = "```";
  const sections = examples.map(
    (ex) =>
      `\n### ${ex.type.toUpperCase()}: ${ex.label}${ex.bestFor ? ` (${ex.bestFor})` : ""}\n${fence}html\n${ex.html}\n${fence}`,
  );

  return `${header}\n${sections.join("\n\n---\n")}`;
}

export const COMPONENT_EXAMPLES = formatComponentExamples(
  COMPONENT_EXAMPLES_LIST,
);
