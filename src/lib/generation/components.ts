export const COMPONENT_EXAMPLES = `
## REFERENCE COMPONENTS

Use these as inspiration for high-quality design patterns. Adapt them to match the project's color palette.

### HERO SECTION (Gradient + Glassmorphism)
\`\`\`html
<section class="relative min-h-screen overflow-hidden bg-slate-950">
  <!-- Animated gradient orbs -->
  <div class="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl"></div>
  <div class="absolute -right-40 top-40 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl"></div>
  <div class="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl"></div>
  
  <div class="relative mx-auto max-w-7xl px-6 py-32">
    <div class="text-center">
      <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
        <span class="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
        <span class="text-sm text-white/70">Now available</span>
      </div>
      <h1 class="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl">
        Build something
        <span class="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          extraordinary
        </span>
      </h1>
      <p class="mx-auto max-w-2xl text-lg text-white/60 leading-relaxed">
        The platform that helps you create, ship, and scale. Trusted by thousands of teams worldwide.
      </p>
      <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a href="#" class="group relative inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-medium text-slate-900 shadow-xl transition hover:shadow-2xl hover:shadow-purple-500/20">
          Get started free
          <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </a>
        <a href="#" class="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 font-medium text-white transition hover:bg-white/5">
          View demo
        </a>
      </div>
    </div>
  </div>
</section>
\`\`\`

### FEATURE CARDS (Bento Grid)
\`\`\`html
<section class="bg-white py-24">
  <div class="mx-auto max-w-7xl px-6">
    <div class="text-center">
      <p class="text-sm font-semibold uppercase tracking-widest text-indigo-600">Features</p>
      <h2 class="mt-2 text-4xl font-bold text-gray-900">Everything you need</h2>
    </div>
    <div class="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <!-- Large feature card -->
      <div class="group relative row-span-2 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white">
        <div class="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl transition group-hover:bg-white/20"></div>
        <div class="relative">
          <div class="mb-4 inline-flex rounded-2xl bg-white/20 p-3">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold">Lightning Fast</h3>
          <p class="mt-2 text-white/80">Built for speed from the ground up. Every interaction feels instant.</p>
        </div>
      </div>
      <!-- Standard cards -->
      <div class="group rounded-3xl border border-gray-200 bg-gray-50 p-8 transition hover:border-indigo-200 hover:bg-indigo-50/50">
        <div class="mb-4 inline-flex rounded-2xl bg-indigo-100 p-3 text-indigo-600">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900">Secure by Default</h3>
        <p class="mt-2 text-gray-600">Enterprise-grade security without the enterprise complexity.</p>
      </div>
      <div class="group rounded-3xl border border-gray-200 bg-gray-50 p-8 transition hover:border-indigo-200 hover:bg-indigo-50/50">
        <div class="mb-4 inline-flex rounded-2xl bg-indigo-100 p-3 text-indigo-600">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900">Flexible Layout</h3>
        <p class="mt-2 text-gray-600">Customize everything to match your workflow.</p>
      </div>
    </div>
  </div>
</section>
\`\`\`

### TESTIMONIAL (Modern Card)
\`\`\`html
<section class="bg-slate-50 py-24">
  <div class="mx-auto max-w-7xl px-6">
    <div class="grid gap-8 lg:grid-cols-3">
      <div class="relative rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
        <div class="mb-6 flex gap-1 text-amber-400">
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
        </div>
        <blockquote class="text-lg text-slate-700">"This completely transformed how we work. The results speak for themselves—40% faster delivery."</blockquote>
        <div class="mt-6 flex items-center gap-4">
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="Sarah Chen" class="h-12 w-12 rounded-full object-cover">
          <div>
            <p class="font-semibold text-slate-900">Sarah Chen</p>
            <p class="text-sm text-slate-500">CTO at TechCorp</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
\`\`\`

### PRICING TABLE
\`\`\`html
<section class="bg-white py-24">
  <div class="mx-auto max-w-7xl px-6">
    <div class="text-center">
      <h2 class="text-4xl font-bold text-gray-900">Simple, transparent pricing</h2>
      <p class="mt-4 text-xl text-gray-600">No hidden fees. Cancel anytime.</p>
    </div>
    <div class="mt-16 grid gap-8 lg:grid-cols-3">
      <!-- Basic -->
      <div class="rounded-3xl border border-gray-200 p-8">
        <h3 class="text-lg font-semibold text-gray-900">Starter</h3>
        <p class="mt-2 text-gray-600">For individuals getting started</p>
        <p class="mt-6"><span class="text-5xl font-bold text-gray-900">$9</span><span class="text-gray-500">/month</span></p>
        <ul class="mt-8 space-y-4">
          <li class="flex items-center gap-3 text-gray-700">
            <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Up to 5 projects
          </li>
        </ul>
        <button class="mt-8 w-full rounded-full border border-gray-300 py-3 font-medium text-gray-900 transition hover:bg-gray-50">Get started</button>
      </div>
      <!-- Pro (highlighted) -->
      <div class="relative rounded-3xl bg-gradient-to-b from-indigo-500 to-indigo-600 p-8 text-white shadow-2xl shadow-indigo-500/30">
        <div class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-1 text-sm font-semibold text-white">Most Popular</div>
        <h3 class="text-lg font-semibold">Pro</h3>
        <p class="mt-2 text-indigo-100">For growing teams</p>
        <p class="mt-6"><span class="text-5xl font-bold">$29</span><span class="text-indigo-200">/month</span></p>
        <button class="mt-8 w-full rounded-full bg-white py-3 font-medium text-indigo-600 transition hover:bg-indigo-50">Get started</button>
      </div>
    </div>
  </div>
</section>
\`\`\`

### STICKY NAVBAR
\`\`\`html
<nav class="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-900/80 backdrop-blur-xl" x-data="{ open: false }">
  <div class="mx-auto max-w-7xl px-6">
    <div class="flex h-16 items-center justify-between">
      <a href="#" class="text-xl font-bold text-white">Brand</a>
      <div class="hidden items-center gap-8 md:flex">
        <a href="#" class="text-sm text-white/70 transition hover:text-white">Features</a>
        <a href="#" class="text-sm text-white/70 transition hover:text-white">Pricing</a>
        <a href="#" class="text-sm text-white/70 transition hover:text-white">About</a>
        <a href="#" class="rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-white/90">Get Started</a>
      </div>
      <button @click="open = !open" class="md:hidden text-white">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path x-show="!open" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          <path x-show="open" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
  <!-- Mobile menu -->
  <div x-show="open" x-transition class="border-t border-white/10 bg-slate-900/95 md:hidden">
    <div class="space-y-1 px-6 py-4">
      <a href="#" class="block py-2 text-white/70">Features</a>
      <a href="#" class="block py-2 text-white/70">Pricing</a>
      <a href="#" class="block py-2 text-white/70">About</a>
    </div>
  </div>
</nav>
\`\`\`

### FOOTER
\`\`\`html
<footer class="bg-slate-900 pt-20 pb-10 text-white">
  <div class="mx-auto max-w-7xl px-6">
    <div class="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
      <div>
        <h3 class="text-lg font-bold">Brand</h3>
        <p class="mt-4 text-sm text-slate-400">Building the future of work, one feature at a time.</p>
      </div>
      <div>
        <h4 class="font-semibold">Product</h4>
        <ul class="mt-4 space-y-2 text-sm text-slate-400">
          <li><a href="#" class="transition hover:text-white">Features</a></li>
          <li><a href="#" class="transition hover:text-white">Pricing</a></li>
          <li><a href="#" class="transition hover:text-white">Integrations</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold">Company</h4>
        <ul class="mt-4 space-y-2 text-sm text-slate-400">
          <li><a href="#" class="transition hover:text-white">About</a></li>
          <li><a href="#" class="transition hover:text-white">Blog</a></li>
          <li><a href="#" class="transition hover:text-white">Careers</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold">Legal</h4>
        <ul class="mt-4 space-y-2 text-sm text-slate-400">
          <li><a href="#" class="transition hover:text-white">Privacy</a></li>
          <li><a href="#" class="transition hover:text-white">Terms</a></li>
        </ul>
      </div>
    </div>
    <div class="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 md:flex-row">
      <p class="text-sm text-slate-500">© 2026 Brand. All rights reserved.</p>
      <div class="flex gap-4">
        <a href="#" class="text-slate-400 transition hover:text-white">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
        </a>
        <a href="#" class="text-slate-400 transition hover:text-white">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
        </a>
      </div>
    </div>
  </div>
</footer>
\`\`\`
`;
