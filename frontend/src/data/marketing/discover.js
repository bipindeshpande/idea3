// ProductDiscover page data
export const seo = {
  title: "Startup Idea Advisor — Discover Ideas",
  description: "Let AI discover personalized startup opportunities tailored to your profile, goals, and constraints. Get ranked recommendations with detailed fit analysis.",
  keywords: "discover startup ideas, ai idea generator, personalized startup recommendations, business idea discovery, startup idea discovery",
  canonical: "/product/discover",
  ogTitle: "Startup Idea Advisor — Discover Ideas",
  ogDescription: "Let AI discover personalized startup opportunities tailored to your profile, goals, and constraints. Get ranked recommendations with detailed fit analysis.",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Startup Idea Discovery",
    applicationCategory: "BusinessApplication",
    description: "AI-powered startup idea discovery tool that generates personalized business opportunities",
    url: "https://ideabunch.com/product/discover",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  }
};

export const heroData = {
  eyebrow: "Founders struggle with too many choices",
  title: "Find the startup idea tailored to YOUR skills, time, budget, lifestyle.",
  subheadline: "AI analyzes your unique profile to recommend ideas that actually fit—not generic suggestions. Get founder fit scoring, real example outputs, and personalized roadmaps.",
  identity: "If you're overwhelmed by too many ideas, you're not alone.",
  loss: "Choosing the wrong idea can cost months. Discover stops that before it starts.",
  urgency: "Your clarity begins with one click.",
  primaryCTA: { to: "/advisor", label: "Find my perfect startup idea" },
  secondaryCTA: { to: "/product", label: "See example results" },
  microcopy: "Takes 60 seconds. Based on your answers.",
  credibilityMicrocopy: "Trusted by founders in 20+ countries.",
  split: "right",
  illustration: {
    gradient: "linear-gradient(45deg, var(--mkt-card-secondary), var(--mkt-card-primary))", /* Replaced orange */
    caption: "Live Preview — Discover Dashboard"
  }
};

export const miniFlowData = {
  title: "Let's see if Discover is right for you",
  steps: [
    {
      question: "Do you have zero, one, or many ideas?",
      options: [
        "Zero ideas - need suggestions",
        "One idea - want to explore alternatives",
        "Many ideas - need help ranking them"
      ]
    },
    {
      question: "How much time can you commit weekly?",
      options: [
        "Less than 5 hours",
        "5-15 hours",
        "15+ hours"
      ]
    },
    {
      question: "What type of ideas are you open to?",
      options: [
        "Tech/SaaS products",
        "Service businesses",
        "Any viable opportunity"
      ]
    }
  ],
  preview: {
    title: "Ranked Idea List with Founder-Fit Scores",
    bullets: [
      "Top 10 ideas matched to your profile",
      "Founder-fit explanation for each recommendation",
      "Time and resource estimates per idea"
    ],
    previewText: "You will get results like this →"
  },
  ctaLabel: "Generate Ideas Based on My Answers →",
  ctaTo: "/product/discover"
};

export const mockupData = {
  url: "https://app.startupideaadvisor.com/advisor",
  caption: "Live Preview — Discover Dashboard",
  badges: [
    { label: "Founder Fit Score", value: "92%", color: "var(--mkt-primary)" },
    { label: "Difficulty", value: "Medium", color: "var(--mkt-card-secondary)" }, /* Replaced orange */
    { label: "Market Freshness", value: "High", color: "var(--mkt-card-accent)" } /* Accent green */
  ]
};

export const useCaseItems = [
  {
    title: "I had 12 ideas but no way to compare them",
    scenario: "I had 12 ideas but no way to compare them.",
    outcome: "Clear ranking, confidence, decision."
  },
  {
    title: "I was stuck in research loops",
    scenario: "I was stuck in research loops.",
    outcome: "Insights in minutes."
  },
  {
    title: "I always picked ideas based on excitement, not fit",
    scenario: "I always picked ideas based on excitement, not fit.",
    outcome: "Founder-fit changed everything."
  }
];

export const predictiveExpectationData = {
  expected: {
    title: "Expected (Generic Ideas)",
    items: [
      "Generic startup ideas",
      "No personalization",
      "No scoring system",
      "One-size-fits-all"
    ]
  },
  actual: {
    title: "Actual Discover Output",
    items: [
      "Tailored to YOUR profile",
      "Founder-fit scoring",
      "Constraint-aware recommendations",
      "Personalized roadmaps"
    ]
  }
};

export const wrongChoiceItems = [
  { title: "You feel stuck even when working hard", desc: "Effort without progress creates frustration" },
  { title: "You start doubting your ability instead of the idea", desc: "Self-blame replaces strategic thinking" },
  { title: "You waste months on something that never matched your strengths", desc: "Time you can't recover" }
];

export const whyUsFeatures = [
  {
    title: "Clarity vs guesswork",
    description: "Get objective scoring and data-driven insights instead of guessing which idea to pursue.",
    tint: "blue", // Primary benefit - most important
    eyebrow: "Data-Driven",
    microBenefit: "No more decision paralysis"
  },
  {
    title: "Founder personalization",
    description: "Every recommendation is tailored to YOUR skills, time, budget, and goals—not generic advice.",
    tint: "purple", // Secondary benefit - supporting
    eyebrow: "Personalized",
    microBenefit: "Ideas that actually fit your life"
  },
  {
    title: "Structured, repeatable insights",
    description: "Use the same frameworks that successful founders use—YC, Lean Startup, and Product Discovery principles.",
    tint: "green", // Success/proven - completion
    eyebrow: "Proven Frameworks",
    microBenefit: "Learn while you build"
  }
];

export const exampleIdeas = [
  {
    title: "AI-Powered Fitness Coach",
    description: "Personalized workout plans based on fitness goals and schedule",
    icon: "🏋️",
    tint: "blue",
    eyebrow: "AI Generated",
    microBenefit: "High market demand, low competition"
  },
  {
    title: "Sustainable Home Goods Marketplace",
    description: "Curated marketplace for eco-friendly home products",
    icon: "🌱",
    tint: "green",
    eyebrow: "AI Generated",
    microBenefit: "Growing sustainability trend"
  },
  {
    title: "Remote Team Collaboration Platform",
    description: "Tools for distributed teams to collaborate effectively",
    icon: "👥",
    tint: "purple",
    eyebrow: "AI Generated",
    microBenefit: "Remote work acceleration"
  }
];

export const features = [
  {
    icon: "🎯",
    title: "Personalized Profile Matching",
    description: "Our AI analyzes your goals, time, budget, skills, and work style to find ideas that truly fit you.",
    tint: "blue", // Primary - most important feature
  },
  {
    icon: "📊",
    title: "Ranked Recommendations",
    description: "Get top 3 ideas with detailed scoring across goal fit, time fit, budget fit, and skill fit.",
    tint: "purple", // Secondary - supporting feature
  },
  {
    icon: "💰",
    title: "Financial Analysis",
    description: "Understand startup costs, revenue potential, and breakeven timelines for each idea.",
    tint: "green", // Success/positive - financial viability is positive
  },
  {
    icon: "⚠️",
    title: "Risk Assessment",
    description: "See potential risks and mitigation strategies before you commit to building.",
    tint: "blue", // Important - critical for decision making
  },
];

export const contentBlocks = [
  {
    title: "Market Research",
    description: "Our AI analyzes market trends, competitor landscapes, and growth opportunities to identify viable ideas that match your profile.",
    gradient: "linear-gradient(135deg, var(--mkt-card-primary), var(--mkt-card-accent))", /* Primary to accent green */
  },
  {
    title: "Financial Modeling",
    description: "Each idea includes detailed financial projections, startup costs, revenue models, and breakeven analysis tailored to your budget.",
    gradient: "linear-gradient(135deg, var(--mkt-card-secondary), var(--mkt-card-primary))", /* Replaced orange/yellow */
    reverse: true
  }
];

export const howItWorksSteps = [
  {
    step: "1",
    title: "Complete Your Profile",
    description: "Share your goals, time commitment, budget, skills, and work style. Our intake form captures everything we need.",
    icon: "📝",
  },
  {
    step: "2",
    title: "AI Generates Ideas",
    description: "Our AI researches markets, analyzes opportunities, and generates personalized startup ideas tailored to your profile.",
    icon: "🤖",
  },
  {
    step: "3",
    title: "Review Recommendations",
    description: "Receive top 3 ranked ideas with detailed fit analysis, financial projections, risk assessment, and roadmaps.",
    icon: "📊",
  },
];

export const deliverables = [
  "Personalized Profile Analysis",
  "Top 3 Ranked Startup Ideas",
  "Goal Fit Scoring",
  "Time Commitment Analysis",
  "Budget Fit Assessment",
  "Skill Match Evaluation",
  "Financial Outlook & Projections",
  "Risk Assessment & Mitigation",
  "30/60/90 Day Roadmap",
  "Validation Questions & Scripts",
];

export const ctaData = {
  title: "Ready to discover your next startup idea?",
  description: "Get personalized recommendations in minutes. No credit card required.",
  primaryCTA: { to: "/advisor", label: "Start Discovery Session" },
  secondaryCTA: { to: "/pricing", label: "View Pricing" },
  credibilityMicrocopy: "Trusted by founders in 20+ countries."
};

