import SectionTitle from "../../../components/marketing/SectionTitle.jsx";

export default function HowItWorksSection({ steps }) {
  return (
    <section className="mkt-section mkt-section-gradient-blue">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          title="How It Works"
          subtitle="Three simple steps from profile to actionable recommendations"
          center
          animate="slide"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {steps.map((item, index) => (
            <div 
              key={index} 
              className="text-center animate-mkt-fadeUp relative"
              style={{ 
                animationDelay: `${index * 0.15}s`,
                marginTop: index === 1 ? "16px" : "0"
              }}
            >
              {index < steps.length - 1 && (
                <div 
                  className="hidden md:block absolute top-6 left-full w-full mkt-dotted-connector"
                  style={{ 
                    width: "calc(100% - 48px)",
                    marginLeft: "24px"
                  }}
                />
              )}
              
              <div className="mkt-step-badge mx-auto mb-4">
                {item.step}
              </div>
              
              <h3 
                className="mkt-h3 font-semibold mb-3"
                style={{ color: "var(--mkt-heading)" }}
              >
                {item.title}
              </h3>
              <p 
                className="mkt-body leading-relaxed"
                style={{ color: "var(--mkt-paragraph)" }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

