/**
 * OutputPreview - A small card showing a sample idea or validation output
 * V9: Behavioral Sequencing component
 * V10: Enhanced with cognitive ease and anchor block
 */
export default function OutputPreview({
  title,
  bullets = [],
  previewText = "You will get results like this →",
  cognitiveEase, // V10: Cognitive ease micro-description
  anchorText, // V10: Anchor block text
  className = "",
}) {
  return (
    <div className={`mkt-preview-frame ${className}`}>
      <p className="text-xs font-semibold mb-3 opacity-80" style={{ color: "var(--mkt-text-dim)" }}>
        {previewText}
      </p>
      <h4 className="font-semibold mb-3 text-sm" style={{ color: "var(--mkt-heading)" }}>
        {title}
      </h4>
      {bullets.length > 0 && (
        <ul className="space-y-2 mb-4">
          {bullets.map((bullet, index) => (
            <li key={index} className="flex items-start gap-2 text-xs" style={{ color: "var(--mkt-paragraph)" }}>
              <span className="text-green-500 mt-0.5">✓</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
      {/* V10: Cognitive Ease micro-description */}
      {cognitiveEase && (
        <p className="mkt-cognitive-ease mb-4 text-xs">
          {cognitiveEase}
        </p>
      )}
      {/* V10: Mini anchor block at bottom */}
      {anchorText && (
        <div className="mkt-anchor mt-4">
          <p className="text-xs font-semibold" style={{ color: "var(--mkt-heading)" }}>
            {anchorText}
          </p>
        </div>
      )}
    </div>
  );
}

