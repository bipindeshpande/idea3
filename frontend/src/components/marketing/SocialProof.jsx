/**
 * SocialProof - V7: Trust-building component with testimonials and logos
 * Displays social proof to build credibility and reduce friction
 */
export default function SocialProof({ 
  className = "",
  showTestimonials = true,
  showLogos = true 
}) {
  const testimonials = [
    {
      quote: "I wasted 2 years on bad ideas. This tool showed me where I fit.",
      author: "Early-stage founder",
      location: "San Francisco, CA"
    },
    {
      quote: "Finally, a way to validate ideas without guessing. The scoring is incredibly detailed.",
      author: "Product manager",
      location: "New York, NY"
    },
    {
      quote: "The personalized recommendations matched my actual constraints. Game changer.",
      author: "Solo builder",
      location: "Austin, TX"
    }
  ];

  return (
    <div className={`${className}`}>
      {/* Trust indicator */}
      {showLogos && (
        <div className="text-center mb-8">
          <p className="text-sm mb-6 opacity-80" style={{ color: "var(--mkt-text-dim)" }}>
            Trusted by founders from 30+ countries
          </p>
          {/* Placeholder logos - YC style grayed-out boxes */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-24 h-12 rounded-lg"
                style={{
                  background: "var(--mkt-surface-muted)",
                  border: "1px solid var(--mkt-outline)"
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      {showTestimonials && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-5 rounded-xl mkt-soft-glow"
              style={{
                background: "var(--mkt-surface)",
                border: "1px solid var(--mkt-outline)"
              }}
            >
              <p 
                className="text-sm mb-4 leading-relaxed"
                style={{ color: "var(--mkt-paragraph)" }}
              >
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full"
                  style={{
                    background: "var(--mkt-primary)",
                    opacity: 0.2
                  }}
                />
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--mkt-heading)" }}>
                    {testimonial.author}
                  </p>
                  <p className="text-xs opacity-70" style={{ color: "var(--mkt-text-dim)" }}>
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

