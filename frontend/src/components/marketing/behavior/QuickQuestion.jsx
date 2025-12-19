import { useState } from "react";

/**
 * QuickQuestion - A single question with selectable options that unlocks next step
 * V9: Behavioral Sequencing component
 */
export default function QuickQuestion({
  question,
  options = [],
  onSelect,
  className = "",
  revealDelay = 0,
}) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (option, index) => {
    setSelected(index);
    if (onSelect) {
      onSelect(option, index);
    }
  };

  return (
    <div className={`mkt-reveal ${className}`} style={{ transitionDelay: `${revealDelay}ms` }}>
      <p className="mkt-question mb-4">{question}</p>
      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            className={`mkt-question-option ${selected === index ? "selected" : ""}`}
            onClick={() => handleSelect(option, index)}
            type="button"
          >
            {typeof option === "string" ? option : option.label || option}
          </button>
        ))}
      </div>
    </div>
  );
}

