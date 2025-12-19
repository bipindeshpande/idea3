import FounderStory from "../../../components/marketing/credibility/FounderStory.jsx";

export default function FounderStorySection({ data }) {
  return (
    <section className="mkt-section-sm" style={{ background: "var(--mkt-surface)" }}>
      <FounderStory {...data} />
    </section>
  );
}

