import Seo from "../../components/common/Seo.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import SocialProof from "../../components/marketing/SocialProof.jsx";
import PersonaGrid from "../../components/marketing/credibility/PersonaGrid.jsx";
import LogoStrip from "../../components/marketing/credibility/LogoStrip.jsx";
import NeuroProof from "../../components/marketing/NeuroProof.jsx";
import MiniFlow from "../../components/marketing/behavior/MiniFlow.jsx";
import SectionTitle from "../../components/marketing/SectionTitle.jsx";
import FeatureCard from "../../components/marketing/FeatureCard.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import { HeroSection } from "../../sections/marketing/templates";
import UIInput from "../../components/ui/ui-input.jsx";
import {
  seo,
  heroData,
  personas,
  persuasionHeader,
  identityPriming,
  neuroProofData,
  templateNavigatorFlowData,
  filterCategories,
  templates,
  whyTemplatesMatter,
  howToUseSteps,
  ctaData
} from "../../data/marketing/templates.js";

export default function ResourceTemplatesPage() {
  return (
    <MarketingLayout>
      <Seo {...seo} />

      <HeroSection data={heroData} />

      <section className="mkt-section-sm" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SocialProof showLogos={true} showTestimonials={true} />
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
        <PersonaGrid personas={personas} />
      </section>

      <section className="mkt-section-sm" style={{ background: "var(--mkt-surface)" }}>
        <LogoStrip count={8} />
      </section>

      <section className="mkt-section-sm" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold" style={{ color: "var(--mkt-heading)" }}>{persuasionHeader.title}</h2>
          <p className="text-sm opacity-80" style={{ color: "var(--mkt-paragraph)" }}>{persuasionHeader.subtitle}</p>
        </div>
      </section>

      <section className="mkt-section-sm" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="mkt-preheadline">{identityPriming.headline}</p>
          <p className="text-sm opacity-80 mkt-cognitive-ease" style={{ color: "var(--mkt-paragraph)" }}>{identityPriming.description}</p>
        </div>
      </section>

      <section className="mkt-section-sm" style={{ background: "var(--mkt-surface)" }}>
        <NeuroProof {...neuroProofData} />
      </section>

      <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-2xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-center" style={{ color: "var(--mkt-heading)" }}>{templateNavigatorFlowData.title}</h3>
          <MiniFlow {...templateNavigatorFlowData} />
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <UIInput
            type="search"
            placeholder="Search templates..."
            className="w-full"
            style={{
              background: "var(--mkt-surface)",
              borderColor: "var(--mkt-outline)",
              fontSize: "var(--mkt-body)"
            }}
          />
          <p className="text-sm text-center opacity-70" style={{ color: "var(--mkt-text-dim)" }}>
            Find templates for planning, validation, research, and modeling.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {filterCategories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                style={{
                  background: "var(--mkt-surface-muted)",
                  color: "var(--mkt-heading)",
                  border: "1px solid var(--mkt-outline)"
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle title="Free Templates" subtitle="Professional templates to help you build your startup" center />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--mkt-heading)" }}>Filter by Category</h3>
                <div className="space-y-2">
                  {["All", ...filterCategories].map((category) => (
                    <button
                      key={category}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm transition-all hover:bg-opacity-50"
                      style={{
                        background: category === "All" ? "var(--mkt-primary)" : "var(--mkt-surface-muted)",
                        color: category === "All" ? "white" : "var(--mkt-heading)"
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {templates.map((template, index) => (
                <FeatureCard
                  key={index}
                  icon={template.icon}
                  title={template.title}
                  description={template.description}
                  tint={template.tint}
                  eyebrow={template.eyebrow || template.category}
                  accentBorder
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-4xl mx-auto px-6">
          <SectionTitle title="Why templates matter" subtitle="The hidden value of structured frameworks" center />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {whyTemplatesMatter.map((item, i) => (
              <div key={i} className="p-5 rounded-xl" style={{ background: "var(--mkt-surface-muted)", border: "1px solid var(--mkt-outline)" }}>
                <h4 className="font-semibold mb-3 text-sm" style={{ color: "var(--mkt-heading)" }}>{item.title}</h4>
                <p className="text-xs" style={{ color: "var(--mkt-paragraph)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-section-gradient-blue">
        <div className="max-w-4xl mx-auto px-6">
          <SectionTitle title="How to Use These Templates" subtitle="Get the most out of our resources" center />
          <div 
            className="rounded-2xl p-10 mkt-card--floating"
            style={{
              background: "var(--mkt-surface)",
              boxShadow: "var(--mkt-layer-shadow)"
            }}
          >
            <div className="space-y-8">
              {howToUseSteps.map((item, index) => (
                <div key={index}>
                  <h3 className="mkt-h3 font-semibold mb-3" style={{ color: "var(--mkt-heading)" }}>{item.title}</h3>
                  <p className="mkt-body leading-relaxed" style={{ color: "var(--mkt-paragraph)" }}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section-lg" style={{ background: "var(--mkt-surface)" }}>
        <CTASection {...ctaData} gradient />
      </section>
    </MarketingLayout>
  );
}
