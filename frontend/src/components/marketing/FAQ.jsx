import { useState } from "react";

/**
 * FAQ - Premium accordion with smooth transitions and icons
 */
export default function FAQ({ items = [], className = "", animate }) {
  const animationClass = animate === "fade" ? " mkt-anim-fade" :
                         animate === "slide" ? " mkt-anim-slide" :
                         animate === "float" ? " mkt-anim-float" : "";
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`${animationClass || ""} ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-2xl mb-4 overflow-hidden transition-all duration-300"
          style={{ 
            border: "1px solid var(--mkt-outline)",
            background: "var(--mkt-surface)"
          }}
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full flex items-center justify-between py-6 px-6 text-left hover:opacity-80 transition-opacity"
            style={{ background: openIndex === index ? "var(--mkt-surface-muted)" : "transparent" }}
          >
            <h3
              className="text-xl font-semibold pr-4 flex-1"
              style={{ color: "var(--mkt-heading)" }}
            >
              {item.question}
            </h3>
            <span
              className={`text-2xl font-bold transition-transform duration-300 flex-shrink-0 ${
                openIndex === index ? "rotate-180" : ""
              }`}
              style={{ color: "var(--mkt-primary)" }}
            >
              ▼
            </span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-6 pb-6">
              <p 
                className="mkt-body leading-relaxed"
                style={{ color: "var(--mkt-paragraph)" }}
              >
                {item.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
