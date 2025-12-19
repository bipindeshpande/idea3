import SectionTitle from "../../../components/marketing/SectionTitle.jsx";
import ContentBlock from "../../../components/marketing/ContentBlock.jsx";

export default function SeeInActionSection({ blocks }) {
  return (
    <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          title="See it in action"
          subtitle="Beautiful, actionable reports that help you make informed decisions"
          center
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blocks.map((block, i) => (
            <ContentBlock
              key={i}
              title={block.title}
              description={block.description}
              visual={{
                gradient: block.gradient,
                content: <div className="w-full h-full flex items-center justify-center"><div className="text-6xl opacity-50">{block.icon}</div></div>
              }}
              reverse={block.reverse}
              animate="slide"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

