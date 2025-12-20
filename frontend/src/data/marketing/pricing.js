// Pricing page data
export const heroData = {
  title: "Start free, upgrade when you need more",
  subtitle: "Get 2 free validations and 4 free discoveries. No credit card required. Upgrade to unlock more when you're ready.",
  primaryCTA: { to: "/register", label: "Find My Startup Idea" },
  secondaryCTA: { to: "/product", label: "See How It Works" }
};

export const preheadline = "Founders waste more time exploring ideas than choosing the right plan.";

export const pricingPrimingText = "Most founders waste more money guessing than upgrading.";

export const costItems = [
  { title: "Months of wasted effort", desc: "Time you can't get back" },
  { title: "Confusion disguised as progress", desc: "Feeling busy but going nowhere" },
  { title: "Trying to validate ideas manually", desc: "Hours of research with no framework" }
];

export const fearRemovalText = {
  title: "No risks. No overcommitment. No credit card required for the free plan.",
  description: "If you're serious about choosing the right idea, upgrading is the most founder-efficient decision you can make."
};

export const credibilityHeadline = "Used by founders across 20+ countries.";

export const neuroProofData = {
  emotionalQuote: "I hesitated to upgrade... until I saw the depth of validation.",
  rationalJustification: "The free plan showed me the framework worked. But upgrading unlocked unlimited validations and deeper analysis. Now I test every idea before committing—no more wasted months.",
  founderName: "Alex Kim",
  founderRole: "Serial entrepreneur",
  ctaText: "This is why founders trust it →",
  ctaTo: "/pricing"
};

export const tiers = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out the service. No credit card required.",
    features: [
      "2 idea validations (included)",
      "4 idea discoveries (included)",
      "3 founder connections/month",
      "Full reports",
      "PDF downloads",
    ],
    highlight: false,
    color: "brand",
    duration_days: 0,
  },
  {
    id: "starter",
    name: "Starter",
    price: "$9",
    period: "per month",
    description: "Best for regular users testing ideas.",
    features: [
      "20 validations/month",
      "10 discoveries/month",
      "15 founder connections/month",
      "Full reports",
      "PDF downloads",
      "Email support",
    ],
    highlight: false,
    color: "brand",
    duration_days: 30,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$15",
    period: "per month",
    description: "For power users and serial entrepreneurs.",
    features: [
      "Unlimited validations",
      "Unlimited discoveries",
      "Unlimited founder connections",
      "Full reports",
      "PDF downloads",
      "Priority support",
    ],
    highlight: true,
    color: "coral",
    duration_days: 30,
  },
  {
    id: "annual",
    name: "Pro Annual",
    price: "$120",
    period: "per year",
    description: "Best value - save $60 (2 months free).",
    features: [
      "Unlimited validations",
      "Unlimited discoveries",
      "Unlimited founder connections",
      "Full reports",
      "PDF downloads",
      "Priority support",
      "Save $60/year",
    ],
    highlight: false,
    color: "brand",
    duration_days: 365,
    annual: true,
  },
];

export const starterValueStackItems = [
  "Unlimited ideas matched to your profile",
  "Deep validation scoring",
  "Founder-fit insights based on 200+ scenarios",
  "Priority processing for recommendations"
];

export const upgradeReasons = [
  { title: "Unlimited idea generation", desc: "Generate as many ideas as you need without limits" },
  { title: "Deeper validation scoring", desc: "Get more detailed analysis and risk assessments" },
  { title: "Faster insights", desc: "Priority processing for quicker results" },
  { title: "Better accuracy", desc: "Advanced AI models with improved matching" }
];

export const purchaseUseCases = [
  {
    title: "I hesitated to upgrade… until I saw the depth of validation.",
    scenario: "I hesitated to upgrade… until I saw the depth of validation.",
    outcome: "The free plan showed me the framework worked. But upgrading unlocked unlimited validations and deeper analysis. Now I test every idea before committing—no more wasted months."
  },
  {
    title: "I wasted months before — not making that mistake again.",
    scenario: "I wasted months before — not making that mistake again.",
    outcome: "After using the free validations, I realized how much time I'd wasted on ideas that were never viable. Upgrading was the smartest decision—I now validate everything before building."
  }
];

export const faqs = [
  {
    question: "What's included in the free plan?",
    answer: "The free plan includes 2 idea validations and 4 idea discoveries, plus 3 founder connections per month. Full reports and PDF downloads are included."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period."
  },
  {
    question: "Do I need technical skills?",
    answer: "No technical skills required. Our platform is designed for founders at any level—from first-time entrepreneurs to experienced operators."
  },
  {
    question: "How accurate are the validations?",
    answer: "Our validations combine AI analysis with structured heuristics based on YC, Lean Startup, and Product Discovery frameworks. We score across 10 critical parameters to give you market-grade insights."
  },
  {
    question: "What makes this different from ChatGPT?",
    answer: "Unlike ChatGPT, we use structured logic and frameworks to provide consistent, repeatable analysis. Every validation follows the same 10-parameter framework, ensuring you get actionable insights, not generic advice."
  },
  {
    question: "How do I know this won't give me unrealistic ideas?",
    answer: "Our AI scores ideas against YOUR actual constraints—time, budget, skills, and goals. We filter out ideas that don't match your profile, so you only see realistic opportunities that fit your real life."
  },
  {
    question: "Why is this better than brainstorming alone?",
    answer: "Brainstorming gives you ideas. We give you ideas PLUS objective scoring, risk assessment, financial projections, and founder-fit analysis. You get the framework to make informed decisions, not just a list of possibilities."
  },
  {
    question: "What if I pick the wrong idea?",
    answer: "That's exactly why we exist. Our validation framework helps you identify mismatches BEFORE you commit months of effort. The free plan includes 2 validations—use them to test ideas before you build. Avoid wasting months on ideas that were never a fit."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards through our payment provider. Your payment information is securely processed and never stored on our servers."
  },
  {
    question: "What happens after my free validations are used?",
    answer: "After using your 2 free validations and 4 free discoveries, you'll need to subscribe to continue. Choose between Starter ($9/month), Pro ($15/month), or Annual ($120/year - save $60)."
  }
];

export const ctaData = {
  title: "Ready to get started?",
  description: "Start with the free plan - no credit card required. Upgrade when you need more.",
  primaryCTA: { to: "/register", label: "Find My Startup Idea" },
  secondaryCTA: { to: "/product", label: "See How It Works" },
  credibilityMicrocopy: "Trusted by founders in 20+ countries."
};

