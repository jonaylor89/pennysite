export const COMPONENT_EXAMPLES = `
## REFERENCE COMPONENTS

These are examples of high-quality, distinctive designs. Study the PRINCIPLES, then create ORIGINAL variations tailored to each project. Never copy these verbatim.

---

### HERO: Bold Typography Focus (Great for SaaS/Dev Tools)
\`\`\`html
<section class="bg-zinc-950 py-32">
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
</section>
\`\`\`

---

### HERO: Split Layout with SVG Illustration (Great for Consultants/Services)
\`\`\`html
<section class="bg-stone-50 py-24">
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
</section>
\`\`\`

---

### HERO: Minimal/Editorial (Great for Portfolios/Writers)
\`\`\`html
<section class="bg-white py-32">
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
</section>
\`\`\`

---

### FEATURES: Icon Grid with Descriptions
\`\`\`html
<section class="bg-white py-24">
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
</section>
\`\`\`

---

### FEATURES: Alternating Layout with Illustrations
\`\`\`html
<section class="bg-slate-50 py-24">
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
</section>
\`\`\`

---

### TESTIMONIALS: Quote Cards
\`\`\`html
<section class="bg-white py-24">
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
</section>
\`\`\`

---

### PRICING: Simple Three Tier
\`\`\`html
<section class="bg-slate-50 py-24">
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
</section>
\`\`\`

---

### CTA: Simple Centered
\`\`\`html
<section class="bg-indigo-600 py-24">
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
</section>
\`\`\`

---

### NAVBAR: Clean with Mobile Menu
\`\`\`html
<nav class="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200" x-data="{ open: false }">
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
</nav>
\`\`\`

---

### FOOTER: Minimal
\`\`\`html
<footer class="bg-gray-900 py-12">
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
</footer>
\`\`\`

---

### SERVICES: Cards for Consultants
\`\`\`html
<section class="bg-white py-24">
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
</section>
\`\`\`

---

### ABOUT: Personal Bio Section
\`\`\`html
<section class="bg-stone-50 py-24">
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
</section>
\`\`\`
`;
