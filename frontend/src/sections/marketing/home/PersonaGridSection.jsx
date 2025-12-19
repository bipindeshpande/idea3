import PersonaGrid from "../../../components/marketing/credibility/PersonaGrid.jsx";

export default function PersonaGridSection({ personas }) {
  return (
    <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
      <PersonaGrid personas={personas} />
    </section>
  );
}

