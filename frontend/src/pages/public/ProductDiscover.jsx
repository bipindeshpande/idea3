import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import SocialProof from "../../components/marketing/SocialProof.jsx";
import MiniFlow from "../../components/marketing/behavior/MiniFlow.jsx";
import UseCaseList from "../../components/marketing/credibility/UseCaseList.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import SectionTitle from "../../components/marketing/SectionTitle.jsx";
import FeatureCard from "../../components/marketing/FeatureCard.jsx";
import ContentBlock from "../../components/marketing/ContentBlock.jsx";
import { HeroSection, MockupSection } from "../../sections/marketing/discover";
import {
  seo,
  heroData,
  miniFlowData,
  mockupData,
  useCaseItems,
  predictiveExpectationData,
  wrongChoiceItems,
  whyUsFeatures,
  exampleIdeas,
  features,
  contentBlocks,
  howItWorksSteps,
  deliverables,
  ctaData
} from "../../data/marketing/discover.js";

export default function ProductDiscoverPage() {
  return (
    <MarketingLayout>
      <Seo 
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        path={seo.canonical}
        ogTitle={seo.ogTitle}
        ogDescription={seo.ogDescription}
        structuredData={seo.structuredData}
      />

      <HeroSection data={heroData} />
      
      <section className="mkt-section-sm" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SocialProof showLogos={true} showTestimonials={true} />
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-2xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-center" style={{ color: "var(--mkt-heading)" }}>
            {miniFlowData.title}
          </h3>
          <MiniFlow {...miniFlowData} />
        </div>
      </section>

      <MockupSection data={mockupData} />

      <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
        <UseCaseList items={useCaseItems} ctaText="See how the product handles this →" ctaTo="/product/discover" />
      </section>

      <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-center" style={{ color: "var(--mkt-heading)" }}>
            Here's what your brain expects — and why Discover exceeds it
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl" style={{ background: "var(--mkt-surface-muted)", border: "1px solid var(--mkt-outline)" }}>
              <h4 className="font-semibold mb-4 text-sm" style={{ color: "var(--mkt-heading)" }}>{predictiveExpectationData.expected.title}</h4>
              <ul className="space-y-2">
                {predictiveExpectationData.expected.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--mkt-paragraph)" }}>
                    <span className="text-gray-400 mt-0.5">○</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-xl mkt-anchor">
              <h4 className="font-semibold mb-4 text-sm" style={{ color: "var(--mkt-heading)" }}>{predictiveExpectationData.actual.title}</h4>
              <ul className="space-y-2">
                {predictiveExpectationData.actual.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--mkt-paragraph)" }}>
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link 
              to="/product/discover" 
              className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
              style={{ color: "var(--mkt-primary)" }}
            >
              Show me ideas that match me →
            </Link>
          </div>
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-4xl mx-auto px-6">
          <SectionTitle title="What happens when you choose wrong?" subtitle="The emotional and practical cost of bad decisions" center />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {wrongChoiceItems.map((item, i) => (
              <div key={i} className="p-5 rounded-xl" style={{ background: "var(--mkt-surface-muted)", border: "1px solid var(--mkt-outline)" }}>
                <h4 className="font-semibold mb-3 text-sm" style={{ color: "var(--mkt-heading)" }}>{item.title}</h4>
                <p className="text-xs" style={{ color: "var(--mkt-paragraph)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl mkt-soft-glow" style={{ background: "var(--mkt-surface)", border: "2px solid var(--mkt-primary)" }}>
            <h4 className="font-semibold mb-3 text-center" style={{ color: "var(--mkt-heading)" }}>Discover fixes this with objective scoring and founder-fit logic.</h4>
            <p className="text-sm text-center opacity-80" style={{ color: "var(--mkt-paragraph)" }}>
              No more guessing. No more self-doubt. Just clear, data-driven recommendations that match your real profile.
            </p>
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-section-gradient-blue">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle title="Why founders choose Startup Advisor" subtitle="What makes us different" center animate="slide" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {whyUsFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-section-bg-light" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle title="Example Ideas Generated" subtitle="See the quality of ideas our AI discovers" center />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exampleIdeas.map((idea, index) => (
              <div key={index} className="animate-mkt-fadeUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <FeatureCard {...idea} />
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link 
              to="/advisor" 
              className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
              style={{ color: "var(--mkt-primary)" }}
            >
              Generate 20 more ideas →
            </Link>
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-section-gradient-blue">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle title="How AI Generates Ideas" subtitle="Our intelligent system matches opportunities to your unique profile" center />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="animate-mkt-fadeUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          {contentBlocks.map((block, i) => (
            <ContentBlock key={i} {...block} />
          ))}
        </div>
      </section>

      <section className="mkt-section mkt-section-gradient-blue">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle title="How Discovery Works" subtitle="Get personalized startup ideas in three steps" center />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="text-center animate-mkt-fadeUp" style={{ animationDelay: `${index * 0.2}s` }}>
                <div 
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 text-xl font-bold"
                  style={{
                    background: "var(--mkt-surface)",
                    color: "var(--mkt-primary)",
                    boxShadow: "var(--mkt-card-shadow)",
                    border: "2px solid var(--mkt-primary)",
                  }}
                >
                  {step.step}
                </div>
                <h3 className="mkt-h3 mb-3" style={{ color: "var(--mkt-heading)" }}>{step.title}</h3>
                <p className="mkt-body" style={{ color: "var(--mkt-paragraph)" }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle title="Discovery Deliverables" subtitle="Everything you'll receive from your discovery session" center />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {deliverables.map((deliverable, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 rounded-lg"
                style={{
                  background: "var(--mkt-surface-muted)",
                  border: "1px solid var(--mkt-outline)",
                }}
              >
                <span className="text-xl mt-0.5" style={{ color: "var(--mkt-primary)" }}>✓</span>
                <span className="text-base font-medium" style={{ color: "var(--mkt-heading)" }}>{deliverable}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection {...ctaData} gradient className="my-12" />
    </MarketingLayout>
  );
}
