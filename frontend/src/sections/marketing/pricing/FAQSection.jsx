import SectionHeader from "../../../components/marketing/SectionHeader.jsx";

export default function FAQSection({ faqs }) {
  return (
    <section className="section-padding" style={{ background: "var(--mkt-surface)" }}>
      <div className="container">
        <SectionHeader 
          title="Frequently Asked Questions" 
          center 
          className="mb-12" 
        />
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i}
              className="group rounded-xl border transition-all duration-200 hover:shadow-md"
              style={{ 
                background: 'var(--mkt-surface)',
                borderColor: 'var(--mkt-outline)',
                padding: 'var(--space-24)',
              }}
            >
              <div className="mb-4">
                <h3 
                  className="text-lg font-semibold"
                  style={{
                    fontFamily: "var(--font-family)",
                    color: "var(--mkt-heading)",
                    lineHeight: "var(--line-height-tight)",
                  }}
                >
                  {faq.question}
                </h3>
              </div>
              <div className="pl-0">
                <p 
                  className="leading-relaxed"
                  style={{
                    fontFamily: "var(--font-family)",
                    fontSize: "var(--font-size-base)",
                    color: "var(--mkt-text-dim)",
                    lineHeight: "var(--line-height-relaxed)",
                  }}
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

