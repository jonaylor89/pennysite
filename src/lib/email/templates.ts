import { SITE_URL } from "./resend";

/**
 * Shared email layout wrapper.
 * All emails use plain HTML for maximum deliverability.
 * When unsubscribeUrl is provided, a one-click unsubscribe link is included.
 */
function layout(content: string, unsubscribeUrl?: string): string {
  const unsubLink = unsubscribeUrl
    ? `<a href="${unsubscribeUrl}">Unsubscribe</a> · `
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #f8f8f6; font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
    .logo { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; color: #1a1a1a; text-decoration: none; }
    .content { margin-top: 32px; font-size: 16px; line-height: 1.6; }
    .content p { margin: 0 0 16px; }
    .btn { display: inline-block; background: #2d6a4f; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600; margin: 8px 0 24px; }
    .muted { color: #6b7280; font-size: 13px; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e5e3; }
    .footer p { font-size: 12px; color: #9ca3af; margin: 0 0 4px; }
    .footer a { color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <a href="${SITE_URL}" class="logo">Pennysite</a>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>
        ${unsubLink}<a href="${SITE_URL}/account">Manage email preferences</a> ·
        <a href="${SITE_URL}">pennysite.app</a>
      </p>
    </div>
  </div>
</body>
</html>`.trim();
}

// ────────────────────────────────────────────────────────────
// Positive-trigger emails (celebrate momentum)
// ────────────────────────────────────────────────────────────

export function sitePublished(
  projectName: string,
  deployedUrl: string,
  unsubscribeUrl?: string,
) {
  return {
    subject: "🎉 Your site is live!",
    html: layout(
      `
      <p>Great news — <strong>${projectName}</strong> is now live on the internet.</p>
      <a href="${deployedUrl}" class="btn">Visit your site →</a>
      <p>Share it with the world! Here are a few ideas:</p>
      <ul style="padding-left: 20px; margin: 0 0 16px;">
        <li>Post the link on social media</li>
        <li>Send it to a friend or client for feedback</li>
        <li>Connect a custom domain for a professional touch</li>
      </ul>
      <p class="muted">You can always edit and republish from your <a href="${SITE_URL}/projects">dashboard</a>.</p>
    `,
      unsubscribeUrl,
    ),
  };
}

export function secondSiteCreated(unsubscribeUrl?: string) {
  return {
    subject: "You're building something great",
    html: layout(
      `
      <p>You just created your second site — you're on a roll.</p>
      <p>Did you know you can:</p>
      <ul style="padding-left: 20px; margin: 0 0 16px;">
        <li><strong>Connect a custom domain</strong> — make it yours</li>
        <li><strong>Click to edit</strong> — double-click any text in the preview to tweak it</li>
        <li><strong>Add more pages</strong> — just ask the AI in the chat</li>
      </ul>
      <a href="${SITE_URL}/projects" class="btn">View your projects →</a>
    `,
      unsubscribeUrl,
    ),
  };
}

// ────────────────────────────────────────────────────────────
// Re-engagement emails (reduce churn)
// ────────────────────────────────────────────────────────────

export function generatedNeverPublished(
  projectName: string,
  projectId: string,
  unsubscribeUrl?: string,
) {
  return {
    subject: "Your site is ready to go live",
    html: layout(
      `
      <p>You built <strong>${projectName}</strong> but haven't published it yet.</p>
      <p>It only takes one click to put it on the internet — free hosting, forever.</p>
      <a href="${SITE_URL}/project/${projectId}" class="btn">Publish now →</a>
      <p class="muted">Not happy with the result? Open the editor and iterate — the AI will refine it for you.</p>
    `,
      unsubscribeUrl,
    ),
  };
}

export function createdNeverEdited(
  projectName: string,
  projectId: string,
  unsubscribeUrl?: string,
) {
  return {
    subject: "3 quick edits to make your site shine",
    html: layout(
      `
      <p>You built <strong>${projectName}</strong> a few days ago — here are three things that can make it even better:</p>
      <ol style="padding-left: 20px; margin: 0 0 16px;">
        <li><strong>Polish the copy</strong> — double-click any text to edit it directly</li>
        <li><strong>Add a page</strong> — try "Add a contact page" in the chat</li>
        <li><strong>Publish it</strong> — put it live with one click</li>
      </ol>
      <a href="${SITE_URL}/project/${projectId}" class="btn">Open your site →</a>
    `,
      unsubscribeUrl,
    ),
  };
}

export function publishedNoEdits(
  projectName: string,
  projectId: string,
  unsubscribeUrl?: string,
) {
  return {
    subject: "Time for a refresh?",
    html: layout(
      `
      <p>Your site <strong>${projectName}</strong> has been live for a while — nice work keeping it out there.</p>
      <p>A quick refresh can make a big difference. You could:</p>
      <ul style="padding-left: 20px; margin: 0 0 16px;">
        <li>Update your copy or services</li>
        <li>Ask the AI to add a testimonials section</li>
        <li>Try a new color scheme</li>
      </ul>
      <a href="${SITE_URL}/project/${projectId}" class="btn">Edit your site →</a>
    `,
      unsubscribeUrl,
    ),
  };
}

export function hasCreditsIdle(
  availableCredits: number,
  unsubscribeUrl?: string,
) {
  return {
    subject: `You have ${availableCredits} credits waiting`,
    html: layout(
      `
      <p>You still have <strong>${availableCredits} credits</strong> in your account — enough for a whole new site.</p>
      <p>Need some inspiration? Try one of these:</p>
      <ul style="padding-left: 20px; margin: 0 0 16px;">
        <li><a href="${SITE_URL}/project/new?prompt=A+landing+page+for+my+freelance+business+with+portfolio+and+contact+form">Freelance portfolio</a></li>
        <li><a href="${SITE_URL}/project/new?prompt=A+coming+soon+page+for+my+next+big+idea+with+email+signup">Coming soon page</a></li>
        <li><a href="${SITE_URL}/project/new?prompt=A+link-in-bio+page+with+all+my+social+profiles+and+projects">Link-in-bio page</a></li>
      </ul>
      <a href="${SITE_URL}/project/new" class="btn">Start building →</a>
    `,
      unsubscribeUrl,
    ),
  };
}

export function purchasedNeverGenerated(unsubscribeUrl?: string) {
  return {
    subject: "You're all set up — let's build",
    html: layout(
      `
      <p>You've got credits loaded and ready to go, but haven't generated your first site yet.</p>
      <p>Just describe what you want in plain English and the AI handles the rest. Try something like:</p>
      <p style="background: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 3px solid #2d6a4f; font-style: italic;">
        "A personal website for a wedding photographer with a gallery, about page, and booking form"
      </p>
      <a href="${SITE_URL}/project/new" class="btn">Create your first site →</a>
    `,
      unsubscribeUrl,
    ),
  };
}

// ────────────────────────────────────────────────────────────
// Onboarding drip sequence
// ────────────────────────────────────────────────────────────

export function welcomeEmail(unsubscribeUrl?: string) {
  return {
    subject: "Welcome to Pennysite",
    html: layout(
      `
      <p>Thanks for joining Pennysite — the website builder that doesn't charge you monthly.</p>
      <p>Here's what you can do:</p>
      <ol style="padding-left: 20px; margin: 0 0 16px;">
        <li><strong>Describe your site</strong> — in plain English, like talking to a designer</li>
        <li><strong>Preview instantly</strong> — see your site take shape in real time</li>
        <li><strong>Publish for free</strong> — your site is hosted forever, no strings attached</li>
      </ol>
      <a href="${SITE_URL}/project/new" class="btn">Build your first site →</a>
      <p class="muted">Reply to this email if you have any questions — a human will answer.</p>
    `,
      unsubscribeUrl,
    ),
  };
}

export function dripPromptTips(unsubscribeUrl?: string) {
  return {
    subject: "Write better prompts, get better sites",
    html: layout(
      `
      <p>A great prompt makes all the difference. Here's what works:</p>
      <p><strong>❌ Vague:</strong> "Make me a website"</p>
      <p><strong>✅ Specific:</strong> "A landing page for a personal trainer with services, transformation testimonials, pricing, and a booking form. Bold, motivating design with dark colors."</p>
      <p>The more detail you give, the better the result. Mention:</p>
      <ul style="padding-left: 20px; margin: 0 0 16px;">
        <li><strong>Pages</strong> — "with an about page, services page, and contact form"</li>
        <li><strong>Tone</strong> — "warm and inviting" or "bold and modern"</li>
        <li><strong>Sections</strong> — "testimonials, FAQ, pricing table"</li>
      </ul>
      <a href="${SITE_URL}/project/new" class="btn">Try a detailed prompt →</a>
    `,
      unsubscribeUrl,
    ),
  };
}

export function dripAddPages(unsubscribeUrl?: string) {
  return {
    subject: "Your site can have multiple pages",
    html: layout(
      `
      <p>Did you know Pennysite builds multi-page sites?</p>
      <p>After your first generation, just type something like:</p>
      <p style="background: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 3px solid #2d6a4f; font-style: italic;">
        "Add a contact page with a form and a map"
      </p>
      <p>The AI will add it to your existing site with matching design and navigation. You can keep iterating as much as you want.</p>
      <a href="${SITE_URL}/projects" class="btn">Open your project →</a>
    `,
      unsubscribeUrl,
    ),
  };
}

export function dripCustomDomain(unsubscribeUrl?: string) {
  return {
    subject: "Make it official with a custom domain",
    html: layout(
      `
      <p>Your Pennysite is hosted for free — but it's even better with your own domain.</p>
      <p>Connecting a custom domain takes about 2 minutes:</p>
      <ol style="padding-left: 20px; margin: 0 0 16px;">
        <li>Open your project and click <strong>Settings</strong></li>
        <li>Enter your domain (e.g., mysite.com)</li>
        <li>Add the DNS record we give you</li>
      </ol>
      <p>That's it — your site is now at your own address, with free SSL.</p>
      <a href="${SITE_URL}/projects" class="btn">Connect a domain →</a>
    `,
      unsubscribeUrl,
    ),
  };
}

export function dripShowcase(unsubscribeUrl?: string) {
  return {
    subject: "See what others are building",
    html: layout(
      `
      <p>People are building all kinds of sites on Pennysite — portfolios, landing pages, event sites, and more.</p>
      <p>A few ideas if you're looking for inspiration:</p>
      <ul style="padding-left: 20px; margin: 0 0 16px;">
        <li><a href="${SITE_URL}/project/new?prompt=A+minimalist+portfolio+for+a+graphic+designer+with+case+studies+and+contact+form">Designer portfolio</a></li>
        <li><a href="${SITE_URL}/project/new?prompt=An+event+page+for+a+birthday+party+with+RSVP+form+and+venue+details">Event page</a></li>
        <li><a href="${SITE_URL}/project/new?prompt=A+restaurant+website+with+menu+hours+location+map+and+reservation+form">Restaurant site</a></li>
      </ul>
      <a href="${SITE_URL}/project/new" class="btn">Build something new →</a>
    `,
      unsubscribeUrl,
    ),
  };
}
