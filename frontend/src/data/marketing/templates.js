// ResourceTemplates page data
export const seo = {
  title: "Startup Idea Advisor — Templates",
  description: "Download free templates for startup idea validation, customer discovery, business planning, and more. Professional templates designed for entrepreneurs.",
  keywords: ["startup templates", "business plan template", "validation template", "customer discovery template", "startup resources"],
  canonical: "/resources/templates",
};

export const heroData = {
  title: "Free Startup Templates",
  subheadline: "Download free templates for validation, customer discovery, business planning, and more. All templates are available to everyone—no sign-up required.",
  primaryCTA: { to: "#templates", label: "Browse Templates" },
  illustration: {
    gradient: "linear-gradient(135deg, var(--mkt-card-secondary), var(--mkt-card-primary))" /* Replaced orange/yellow */
  }
};

export const personas = [
  {
    label: "Founders validating an idea",
    description: "Need structured frameworks to test assumptions",
    icon: "✅"
  },
  {
    label: "Founders seeking fast planning",
    description: "Want templates to accelerate your process",
    icon: "⚡"
  },
  {
    label: "Founders needing structure",
    description: "Looking for proven frameworks to follow",
    icon: "📋"
  },
  {
    label: "Founders overwhelmed by ambiguity",
    description: "Want clear steps instead of blank pages",
    icon: "🎯"
  }
];

export const persuasionHeader = {
  title: "Plan faster. Validate smarter. Use what real founders use.",
  subtitle: "These aren't generic templates. They're based on proven founder frameworks."
};

export const identityPriming = {
  headline: "Real founders don't start from scratch — they start from structure.",
  description: "These templates reflect how experienced founders think."
};

export const neuroProofData = {
  emotionalQuote: "These templates saved me weeks of research and trial-and-error.",
  rationalJustification: "Every template follows proven frameworks from YC, Lean Startup, and Product Discovery. Instead of guessing what to include, I had a clear structure from day one.",
  founderName: "Marcus Rodriguez",
  founderRole: "Product Manager",
  ctaText: "This is why founders trust it →",
  ctaTo: "/resources/templates"
};

export const templateNavigatorFlowData = {
  title: "Not sure which template you need?",
  steps: [
    {
      question: "Are you validating or planning?",
      options: [
        "Validating an idea",
        "Planning a launch",
        "Both"
      ]
    },
    {
      question: "How detailed do you want your process?",
      options: [
        "Quick checklist",
        "Detailed framework",
        "Comprehensive guide"
      ]
    },
    {
      question: "Do you want structured or flexible templates?",
      options: [
        "Structured (step-by-step)",
        "Flexible (adaptable)",
        "Either works"
      ]
    }
  ],
  preview: {
    title: "Customer Discovery Template",
    bullets: [
      "Interview script with 20+ questions",
      "Validation checklist",
      "Market research framework"
    ],
    previewText: "You will get results like this →"
  },
  ctaLabel: "Show Me the Templates I Need →",
  ctaTo: "/resources/templates"
};

export const filterCategories = ["Validation", "Market", "Finance", "Planning"];

export const templates = [
  {
    icon: "📋",
    title: "Idea Validation Template",
    description: "Structured framework for validating your startup idea across 10 key parameters. Includes scoring sheets and action plans.",
    tint: "blue", // Primary - most important template
    category: "Validation",
    eyebrow: "Validation",
  },
  {
    icon: "👥",
    title: "Customer Discovery Script",
    description: "Ready-to-use interview scripts for customer discovery. Includes questions, follow-ups, and analysis framework.",
    tint: "purple", // Secondary - supporting template
    category: "Discovery",
    eyebrow: "Discovery",
  },
  {
    icon: "📊",
    title: "Business Model Canvas",
    description: "Interactive canvas for mapping your business model. Visual framework for planning revenue, costs, and value proposition.",
    tint: "green", // Success/positive - planning leads to success
    category: "Planning",
    eyebrow: "Planning",
  },
  {
    icon: "💰",
    title: "Financial Projections Template",
    description: "Excel template for startup financial projections. Includes revenue models, expense tracking, and breakeven analysis.",
    tint: "blue", // Important - cycles back to primary
    category: "Finance",
    eyebrow: "Finance",
  },
  {
    icon: "🎯",
    title: "Go-to-Market Plan",
    description: "Step-by-step template for planning your launch. Includes market entry strategy, channels, and metrics.",
    tint: "purple", // Secondary - supporting template
    category: "Marketing",
  },
  {
    icon: "🤝",
    title: "Co-Founder Agreement Template",
    description: "Legal template for co-founder agreements. Covers equity, roles, vesting, and conflict resolution.",
    tint: "green", // Success - positive collaboration outcome
    category: "Legal",
  },
];

export const whyTemplatesMatter = [
  { title: "They reduce ambiguity", desc: "Clear structure eliminates guesswork" },
  { title: "They eliminate reinventing the wheel", desc: "Use what's already proven to work" },
  { title: "They let you think like an experienced founder instantly", desc: "Learn frameworks while you build" }
];

export const howToUseSteps = [
  {
    title: "1. Download & Customize",
    description: "All templates are available in editable formats (PDF, Excel, Google Docs). Customize them to fit your specific needs.",
  },
  {
    title: "2. Follow the Framework",
    description: "Each template includes instructions and best practices. Follow the framework to ensure you cover all important aspects.",
  },
  {
    title: "3. Iterate & Improve",
    description: "Templates are starting points. Update them as you learn more about your market, customers, and business model.",
  },
];

export const ctaData = {
  title: "Need more help with your startup?",
  description: "Get AI-powered recommendations and personalized guidance for your startup journey.",
  primaryCTA: { to: "/advisor", label: "Get Started" },
  secondaryCTA: { to: "/resources", label: "View All Resources" },
  credibilityMicrocopy: "Free templates. No sign-up required."
};

