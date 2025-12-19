// ProductValidate page data
export const seo = {
  title: "Startup Idea Advisor — Validate Ideas",
  description: "Validate your startup idea across 10 critical parameters. Get comprehensive analysis including market opportunity, financial viability, risk assessment, and more.",
  keywords: "idea validation, startup validation, validate business idea, startup idea analysis, idea feasibility, business idea validation",
  canonical: "/product/validate",
  ogTitle: "Startup Idea Advisor — Validate Ideas",
  ogDescription: "Validate your startup idea across 10 critical parameters. Get comprehensive analysis including market opportunity, financial viability, risk assessment, and more.",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Startup Idea Validation",
    applicationCategory: "BusinessApplication",
    description: "Comprehensive startup idea validation tool analyzing 10 critical parameters",
    url: "https://ideabunch.com/product/validate",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  }
};

export const heroData = {
  eyebrow: "Founders waste time on unvalidated ideas",
  title: "Validate your idea with market-grade logic",
  subheadline: "Get comprehensive validation across 10 critical parameters. Know if your startup idea is worth pursuing before you commit time, money, or resources.",
  identity: "If you're the kind of founder who wants to build wisely, not blindly, validation is your superpower.",
  loss: "The cost of building the wrong thing is far greater than the cost of validating it.",
  urgency: "Clarity compounds. Start today.",
  primaryCTA: { to: "/validate-idea", label: "Run my validation" },
  secondaryCTA: { to: "/product", label: "See example results" },
  microcopy: "Before you commit.",
  credibilityMicrocopy: "Trusted by founders in 20+ countries.",
  split: "left",
  illustration: {
    gradient: "linear-gradient(135deg, var(--mkt-card-blue), var(--mkt-card-purple))",
    caption: "Live Preview — Validation Dashboard"
  }
};

export const mockupData = {
  url: "https://app.startupideaadvisor.com/validate-result",
  caption: "Live Preview — Validation Dashboard",
  kpis: [
    { label: "Market Fit", value: "8.5/10", desc: "Strong demand indicators", color: "var(--mkt-primary)" },
    { label: "Financial Viability", value: "7.8/10", desc: "Positive projections", color: "var(--mkt-card-green)" },
    { label: "Strength Assessment", value: "8.2/10", desc: "Well-positioned", color: "var(--mkt-card-purple)" }
  ]
};

export const riskAwarenessFlowData = {
  title: "Before you build — understand your risk profile",
  steps: [
    {
      question: "What is your biggest fear?",
      options: [
        "Building the wrong thing",
        "Market demand uncertainty",
        "Wasting months building alone"
      ]
    },
    {
      question: "How do you usually evaluate ideas?",
      options: [
        "Gut feeling",
        "Asking friends",
        "Some research"
      ]
    },
    {
      question: "How fast do you want validation insights?",
      options: [
        "Immediate results",
        "Within 24 hours",
        "Detailed analysis (2-3 days)"
      ]
    }
  ],
  preview: {
    title: "Comprehensive Validation Report",
    bullets: [
      "Market Fit Score: 8.5/10",
      "Financial Viability: 7.8/10",
      "Strength Assessment: 8.2/10"
    ],
    previewText: "You will get results like this →"
  },
  ctaLabel: "Run My Validation Assessment →",
  ctaTo: "/product/validate"
};

export const fearReliefData = {
  fear: {
    title: "What if you're validating the wrong thing?",
    items: [
      "You spend months building features nobody wants",
      "You realize the market doesn't exist after launch",
      "You waste time on ideas that were never viable"
    ]
  },
  relief: {
    title: "How Validation Prevents This",
    description: "Our validation framework scores your idea across 10 critical parameters before you commit time or money. You get market-grade insights that reveal mismatches early—saving months of wasted effort."
  }
};

export const authorityStripItems = [
  "Risk scoring based on proven frameworks",
  "Prevents common founder mistakes",
  "Designed alongside product managers"
];

export const founderStoryData = {
  name: "(Founder Name Placeholder)",
  role: "Creator of Startup Advisor",
  story: "I made the mistake of building before validating. I spent months on an idea that seemed perfect—until I realized the market didn't exist. That frustration led me to build a structured validation framework.",
  reason: "Validation matters because it reveals mismatches before you commit. Using structured validation changed everything—I stopped wasting time on ideas that were never viable.",
  identity: "If you've ever wondered 'what if I'm building the wrong thing?'—structured validation is your answer."
};

export const noValidationItems = [
  { title: "You mistake enthusiasm for demand", desc: "Friends saying 'great idea' isn't market validation" },
  { title: "You assume market size instead of verifying", desc: "Big numbers don't mean accessible customers" },
  { title: "You build features people never asked for", desc: "Solving problems that don't exist" }
];

export const validationLogicItems = [
  { title: "Market size estimation", desc: "Realistic TAM, SAM, and SOM calculations" },
  { title: "Risk scoring", desc: "10-parameter risk assessment with severity ratings" },
  { title: "Feasibility factors", desc: "Technical, operational, and resource constraints" },
  { title: "Operational constraints", desc: "Time, budget, and skill requirements" },
  { title: "Development complexity", desc: "Build difficulty and timeline estimates" }
];

export const whyUsFeatures = [
  {
    title: "Clarity vs guesswork",
    description: "Get objective scoring and data-driven insights instead of guessing which idea to pursue.",
    tint: "blue",
    eyebrow: "Data-Driven",
    microBenefit: "No more decision paralysis"
  },
  {
    title: "Founder personalization",
    description: "Every recommendation is tailored to YOUR skills, time, budget, and goals—not generic advice.",
    tint: "purple",
    eyebrow: "Personalized",
    microBenefit: "Ideas that actually fit your life"
  },
  {
    title: "Structured, repeatable insights",
    description: "Use the same frameworks that successful founders use—YC, Lean Startup, and Product Discovery principles.",
    tint: "orange",
    eyebrow: "Proven Frameworks",
    microBenefit: "Learn while you build"
  }
];

export const validationFeatures = [
  {
    icon: "📈",
    title: "Market Opportunity",
    description: "Analyze market size, growth trends, and addressable market to assess opportunity.",
    tint: "blue",
  },
  {
    icon: "⚔️",
    title: "Competitive Landscape",
    description: "Understand competitors, differentiation opportunities, and barriers to entry.",
    tint: "purple",
  },
  {
    icon: "💰",
    title: "Financial Viability",
    description: "Assess startup costs, revenue projections, and financial sustainability.",
    tint: "orange",
  },
  {
    icon: "⚠️",
    title: "Risk Assessment",
    description: "Identify key risks with severity ratings and mitigation strategies.",
    tint: "green",
  },
];

export const scorecards = [
  {
    title: "Market Analysis",
    description: "We assess market size, growth potential, competitive landscape, and your positioning to give you a clear picture of opportunity.",
    gradient: "linear-gradient(135deg, var(--mkt-card-blue), var(--mkt-card-green))",
  },
  {
    title: "Financial Projections",
    description: "Detailed financial modeling including startup costs, revenue forecasts, unit economics, and breakeven analysis.",
    gradient: "linear-gradient(135deg, var(--mkt-card-orange), var(--mkt-card-yellow))",
    reverse: true
  }
];

export const howItWorksSteps = [
  {
    step: "1",
    title: "Submit Your Idea",
    description: "Describe your startup idea, target market, and business model. Our system captures all the details needed for analysis.",
    icon: "💡",
  },
  {
    step: "2",
    title: "AI Validates Across 10 Parameters",
    description: "Our AI analyzes market opportunity, competitive landscape, financial viability, risks, and more across 10 critical dimensions.",
    icon: "🔍",
  },
  {
    step: "3",
    title: "Receive Validation Report",
    description: "Get a comprehensive report with scores, insights, risk assessment, and actionable recommendations for each parameter.",
    icon: "📋",
  },
];

export const deliverables = [
  "Overall Validation Score",
  "Market Opportunity Analysis",
  "Problem-Solution Fit Assessment",
  "Competitive Landscape Review",
  "Target Audience Clarity",
  "Business Model Viability",
  "Technical Feasibility Analysis",
  "Financial Sustainability Projections",
  "Scalability Potential Assessment",
  "Risk Assessment & Mitigation",
  "Go-to-Market Strategy",
  "Actionable Recommendations",
];

export const ctaData = {
  title: "Ready to validate your startup idea?",
  description: "Get comprehensive validation across 10 critical parameters. Start now—no credit card required.",
  primaryCTA: { to: "/validate-idea", label: "Validate Your Idea" },
  secondaryCTA: { to: "/pricing", label: "View Pricing" },
  credibilityMicrocopy: "Trusted by founders in 20+ countries."
};

