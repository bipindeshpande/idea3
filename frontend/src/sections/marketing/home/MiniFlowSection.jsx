import MiniFlow from "../../../components/marketing/behavior/MiniFlow.jsx";

export default function MiniFlowSection({ data }) {
  return (
    <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
      <MiniFlow {...data} />
    </section>
  );
}

