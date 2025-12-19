/**
 * AuthorityStrip - V11: Discreet but powerful authority cues
 * Displays horizontal row of authority badges
 */
export default function AuthorityStrip({
  items = [],
  className = "",
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`max-w-7xl mx-auto px-6 ${className}`}>
      <div className="flex flex-wrap justify-center items-center gap-3">
          {items.map((item, index) => (
            <span key={index} className="mkt-authority-badge">
              {item}
            </span>
          ))}
        </div>
      </div>
  );
}

