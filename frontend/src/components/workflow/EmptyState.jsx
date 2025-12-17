import UICard from "../ui/ui-card.jsx";
import UIHeading from "../ui/ui-heading.jsx";
import UIButton from "../ui/ui-button.jsx";

export default function EmptyState({
  title = "Nothing here yet",
  description,
  primaryAction,
  secondaryAction,
  className = "",
}) {
  return (
    <UICard variant="muted" className={`p-6 ${className}`}>
      <UIHeading level="h2">{title}</UIHeading>
      {description ? <p className="text-secondary" style={{ marginTop: 8 }}>{description}</p> : null}
      {(primaryAction || secondaryAction) ? (
        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {primaryAction ? (
            <UIButton variant="primary" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </UIButton>
          ) : null}
          {secondaryAction ? (
            <UIButton variant="secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </UIButton>
          ) : null}
        </div>
      ) : null}
    </UICard>
  );
}


