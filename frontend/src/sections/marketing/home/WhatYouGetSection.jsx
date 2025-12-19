import SectionTitle from "../../../components/marketing/SectionTitle.jsx";
import FeatureCard from "../../../components/marketing/FeatureCard.jsx";

export default function WhatYouGetSection({ items }) {
  return (
    <section className="mkt-section-sm mkt-section-gradient-purple">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          title="What You Get"
          subtitle="Everything you need to move from idea to action"
          center
          animate="slide"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div key={index} className="scroll-reveal">
              <FeatureCard {...item} animate="fade" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

