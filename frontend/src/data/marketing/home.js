// Home page data
export const seo = {
  title: "Startup Idea Advisor — Validate Ideas & Discover Opportunities",
  description: "Transform your profile into validated startup ideas with AI-powered analysis, financial outlook, and actionable roadmaps. Validate existing ideas or discover personalized opportunities.",
  keywords: ["startup ideas", "idea validation", "business ideas", "startup advisor", "ai startup", "idea discovery"],
  canonical: "/",
};

export const heroData = {
  eyebrow: "Founders struggle with clarity",
  title: "Find the startup you were meant to build.",
  subheadline: "AI analyzes your skills, pace, constraints, and goals to recommend ideas that fit your real life—not someone else's.",
  identity: "If you're the kind of founder who wants clarity instead of chaos, you're in the right place.",
  loss: "Most great founders don't fail from lack of effort. They fail by choosing the wrong starting point.",
  urgency: "Takes less than 60 seconds to begin.",
  primaryCTA: { to: "/advisor", label: "Find My Startup Idea" },
  secondaryCTA: { to: "/product", label: "See Example Outputs" },
  microcopy: "Takes 60 seconds. Based on your answers.",
  credibilityMicrocopy: "Trusted by founders in 20+ countries.",
  illustration: {
    gradient: "linear-gradient(135deg, var(--mkt-card-blue), var(--mkt-card-purple))"
  }
};

export const features = [
  {
    icon: "🎯",
    title: "Personalized Profile Analysis",
    description: "Deep insights into your motivations, constraints, strengths, and opportunity angles tailored to your unique profile.",
    tint: "blue",
  },
  {
    icon: "💡",
    title: "Ranked Startup Ideas",
    description: "Top 3 ideas scored against your goals, time commitment, budget, and skills with detailed fit analysis.",
    tint: "purple",
  },
  {
    icon: "💰",
    title: "Financial Outlook",
    description: "Realistic startup costs, revenue projections, and breakeven timelines that respect your budget constraints.",
    tint: "orange",
  },
  {
    icon: "⚠️",
    title: "Risk Radar",
    description: "Identified risks with severity ratings and actionable mitigation strategies for each recommendation.",
    tint: "green",
  },
  {
    icon: "🔍",
    title: "Validation Questions",
    description: "Customer discovery scripts with guidance on what to listen for and how to act on responses.",
    tint: "yellow",
  },
];

export const miniFlowData = {
  title: "Let's find out where you are in your founder journey",
  steps: [
    {
      question: "What are you trying to achieve?",
      options: [
        "Find an idea",
        "Validate an idea",
        "Explore templates"
      ]
    },
    {
      question: "What best describes your situation?",
      options: [
        "Busy professional with limited time",
        "Technical builder",
        "Student or early-stage founder"
      ]
    },
    {
      question: "How fast do you want insights?",
      options: [
        "Fast results",
        "Step-by-step guidance",
        "Deep analysis"
      ]
    }
  ],
  preview: {
    title: "Personalized Startup Recommendations",
    bullets: [
      "Ideas ranked by founder-fit score",
      "Detailed validation reports",
      "Actionable roadmaps tailored to your profile"
    ],
    previewText: "You will get results like this →"
  },
  ctaLabel: "Continue with My Personalized Flow →",
  ctaTo: "/product/discover"
};

export const personas = [
  {
    label: "Busy Professionals",
    description: "Starting part-time, need clarity on what fits your schedule",
    icon: "💼"
  },
  {
    label: "Solo Builders",
    description: "Validating feasibility before committing resources",
    icon: "🔨"
  },
  {
    label: "First-Time Founders",
    description: "Seeking clarity and structure in your journey",
    icon: "🚀"
  },
  {
    label: "Technical Builders",
    description: "Exploring ideas with technical depth and validation",
    icon: "⚡"
  }
];

export const founderStoryData = {
  name: "(Founder Name Placeholder)",
  role: "Creator of Startup Advisor",
  story: "I spent years building ideas that didn't fit my life. I had the skills, but I kept choosing opportunities that required more time, money, or expertise than I actually had. The frustration wasn't from lack of effort—it was from starting at the wrong point.",
  reason: "That's why I built Startup Advisor. I wanted a tool that would match ideas to real founder profiles—not generic advice, but personalized recommendations that respect your actual constraints. Every analysis uses proven frameworks from YC, Lean Startup, and Product Discovery to give you market-grade insights.",
  identity: "If you're like me when I started—overwhelmed but determined—this tool is for you."
};

export const beforeAfterData = {
  before: [
    "Confusion about which idea to pursue",
    "Uncertainty about market fit",
    "No framework for validation",
    "Guessing at financial viability",
    "No clear next steps"
  ],
  after: [
    "Clarity on which ideas fit your profile",
    "Direction with ranked recommendations",
    "Confidence from objective scoring",
    "A clear framework for validation",
    "Actionable next steps with roadmaps"
  ]
};

export const clarityMattersItems = [
  {
    title: "Ideas are infinite. Your time isn't.",
    description: "Every day spent on the wrong idea is a day you can't get back."
  },
  {
    title: "A good idea chosen at the wrong phase of life becomes a bad idea.",
    description: "Timing and fit matter more than the idea itself."
  },
  {
    title: "Clarity reduces wasted years.",
    description: "Know what fits before you commit months of effort."
  }
];

export const howItWorksSteps = [
  {
    step: "1",
    title: "Tell us about you",
    description: "Share your goals, time commitment, budget, interests, work style, and experience. Our intake form captures what matters.",
  },
  {
    step: "2",
    title: "AI analyzes your profile",
    description: "Our AI system researches markets, analyzes financials, assesses risks, and validates ideas based on your profile.",
  },
  {
    step: "3",
    title: "Get your reports",
    description: "Receive a comprehensive profile analysis, ranked recommendations, and a full report with actionable next steps.",
  },
];

export const seeInActionBlocks = [
  {
    title: "Validation Reports",
    description: "Get comprehensive validation across 10 critical parameters. See detailed scores, risk assessments, and actionable insights in a beautifully formatted report.",
    gradient: "linear-gradient(135deg, var(--mkt-card-blue), var(--mkt-card-green))",
    icon: "📊"
  },
  {
    title: "Idea Discovery",
    description: "Discover personalized startup ideas tailored to your unique profile. Each idea includes financial projections, market analysis, and a 30/60/90 day roadmap.",
    gradient: "linear-gradient(135deg, var(--mkt-card-purple), var(--mkt-card-orange))",
    icon: "💡",
    reverse: true
  }
];

export const whatYouGetItems = [
  {
    title: "Profile Summary",
    description: "Structured analysis of your motivations, constraints, strengths, and strategic considerations.",
    icon: "📊",
    tint: "blue",
  },
  {
    title: "Recommendation Matrix",
    description: "Compare ideas across goal fit, time fit, budget fit, skill fit, and work style alignment.",
    icon: "📈",
    tint: "green",
  },
  {
    title: "Complete PDF Report",
    description: "Download a comprehensive PDF combining profile analysis, recommendations, and full report sections.",
    icon: "📄",
    tint: "orange",
  },
];

export const finalCTAData = {
  title: "Ready to validate your idea?",
  description: "Get AI-powered recommendations tailored to your profile, goals, and constraints. No credit card required.",
  primaryCTA: { to: "/validate-idea", label: "Validate Idea" },
  secondaryCTA: { to: "/advisor", label: "Discover Ideas" }
};

