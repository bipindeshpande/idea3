# Page Structure Visualization

## 🏠 Landing Page (`pages/public/Home.jsx`)

```
┌─────────────────────────────────────────────────────────────┐
│  MarketingLayout.jsx                                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Navigation.jsx (from common)                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Seo.jsx (from common)                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 1: Hero                                       │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  sections/marketing/home/HeroSection.jsx               │  │
│  │    └─> components/marketing/Hero.jsx                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 2: Social Proof                               │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  sections/marketing/home/SocialProofSection.jsx        │  │
│  │    └─> components/marketing/SocialProof.jsx            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 3: Mini Flow                                  │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  sections/marketing/home/MiniFlowSection.jsx           │  │
│  │    └─> components/marketing/behavior/MiniFlow.jsx      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 4: Persona Grid                              │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  sections/marketing/home/PersonaGridSection.jsx       │  │
│  │    └─> components/marketing/credibility/PersonaGrid.jsx│  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 5: Founder Story                              │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  sections/marketing/home/FounderStorySection.jsx       │  │
│  │    └─> components/marketing/credibility/FounderStory.jsx│ │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 6: Before/After                               │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  sections/marketing/home/BeforeAfterSection.jsx       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 7: Clarity Matters                            │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  sections/marketing/home/ClarityMattersSection.jsx     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 8: How It Works                               │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  sections/marketing/home/HowItWorksSection.jsx         │  │
│  │    └─> components/marketing/SectionTitle.jsx            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 9: See In Action                              │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  sections/marketing/home/SeeInActionSection.jsx        │  │
│  │    ├─> components/marketing/SectionTitle.jsx           │  │
│  │    └─> components/marketing/ContentBlock.jsx           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 10: What You Get                              │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  sections/marketing/home/WhatYouGetSection.jsx         │  │
│  │    ├─> components/marketing/SectionTitle.jsx           │  │
│  │    └─> components/marketing/FeatureCard.jsx            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 11: Final CTA                                 │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  sections/marketing/home/FinalCTASection.jsx           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Footer.jsx (from common)                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Product Page (`pages/public/Product.jsx`)

```
┌─────────────────────────────────────────────────────────────┐
│  MarketingLayout.jsx                                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Navigation.jsx (from common)                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Seo.jsx (from common)                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 1: Hero                                       │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  sections/marketing/product/HeroSection.jsx            │  │
│  │    └─> components/marketing/Hero.jsx                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 2: See It In Action                          │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  Inline section in Product.jsx                        │  │
│  │    ├─> components/marketing/SectionTitle.jsx           │  │
│  │    └─> components/marketing/mockups/MockupBrowser.jsx  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 3: Why Us                                    │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  Inline section in Product.jsx                        │  │
│  │    ├─> components/marketing/SectionTitle.jsx           │  │
│  │    └─> components/marketing/FeatureCard.jsx (x3)      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 4: What You Get                              │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  Inline section in Product.jsx                        │  │
│  │    ├─> components/marketing/SectionTitle.jsx           │  │
│  │    └─> components/marketing/FeatureCard.jsx (x6)      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 5: 10-Parameter Validation Framework         │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  Inline section in Product.jsx                        │  │
│  │    └─> components/marketing/SectionTitle.jsx           │  │
│  │    (10 parameter cards rendered inline)               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 6: Product Features Deep Dive                │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  Inline section in Product.jsx                        │  │
│  │    └─> components/marketing/ContentBlock.jsx (x3)     │  │
│  │        - Discover Ideas                               │  │
│  │        - Validate Ideas                               │  │
│  │        - Founder Network                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 7: Founder Connect Highlight                │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  Inline section in Product.jsx                        │  │
│  │    (Custom card with emoji and list)                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 8: See Our Products                          │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  Inline section in Product.jsx                        │  │
│  │    ├─> components/marketing/SectionTitle.jsx           │  │
│  │    └─> components/marketing/FeatureCard.jsx (x3)      │  │
│  │        - Discover Ideas (link)                        │  │
│  │        - Validate Ideas (link)                        │  │
│  │        - Founder Network (link)                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 9: How It Works                              │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  Inline section in Product.jsx                        │  │
│  │    └─> components/marketing/SectionTitle.jsx           │  │
│  │    (3-step process rendered inline)                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 10: What You'll Receive                      │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  Inline section in Product.jsx                        │  │
│  │    └─> components/marketing/SectionTitle.jsx           │  │
│  │    (10 deliverable items rendered inline)             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SECTION 11: CTA Section                              │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  components/marketing/CTASection.jsx                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Footer.jsx (from common)                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Component File Reference

### Landing Page Components:
1. **HeroSection** → `sections/marketing/home/HeroSection.jsx` → `components/marketing/Hero.jsx`
2. **SocialProofSection** → `sections/marketing/home/SocialProofSection.jsx` → `components/marketing/SocialProof.jsx`
3. **MiniFlowSection** → `sections/marketing/home/MiniFlowSection.jsx` → `components/marketing/behavior/MiniFlow.jsx`
4. **PersonaGridSection** → `sections/marketing/home/PersonaGridSection.jsx` → `components/marketing/credibility/PersonaGrid.jsx`
5. **FounderStorySection** → `sections/marketing/home/FounderStorySection.jsx` → `components/marketing/credibility/FounderStory.jsx`
6. **BeforeAfterSection** → `sections/marketing/home/BeforeAfterSection.jsx`
7. **ClarityMattersSection** → `sections/marketing/home/ClarityMattersSection.jsx`
8. **HowItWorksSection** → `sections/marketing/home/HowItWorksSection.jsx` → `components/marketing/SectionTitle.jsx`
9. **SeeInActionSection** → `sections/marketing/home/SeeInActionSection.jsx` → `components/marketing/ContentBlock.jsx`
10. **WhatYouGetSection** → `sections/marketing/home/WhatYouGetSection.jsx` → `components/marketing/FeatureCard.jsx`
11. **FinalCTASection** → `sections/marketing/home/FinalCTASection.jsx`

### Product Page Components:
1. **Hero** → `sections/marketing/product/HeroSection.jsx` → `components/marketing/Hero.jsx`
2. **SectionTitle** → `components/marketing/SectionTitle.jsx` (used in multiple sections)
3. **MockupBrowser** → `components/marketing/mockups/MockupBrowser.jsx`
4. **FeatureCard** → `components/marketing/FeatureCard.jsx` (used in multiple sections)
5. **ContentBlock** → `components/marketing/ContentBlock.jsx` (used in Product Features section)
6. **CTASection** → `components/marketing/CTASection.jsx`

### Shared Layout Components:
- **MarketingLayout** → `layouts/MarketingLayout.jsx`
- **Navigation** → `components/common/Navigation.jsx`
- **Footer** → `components/common/Footer.jsx`
- **Seo** → `components/common/Seo.jsx`

