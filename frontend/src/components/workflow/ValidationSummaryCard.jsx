import UICard from "../ui/ui-card.jsx";
import UIHeading from "../ui/ui-heading.jsx";
import UIBadge from "../ui/ui-badge.jsx";
import UIDivider from "../ui/ui-divider.jsx";

export default function ValidationSummaryCard({
  title = "Validation summary",
  scoreLabel,
  scoreValue,
  risk,
  highlights = [],
  className = "",
}) {
  return (
    <UICard className={["ui-pad-md", className].filter(Boolean).join(" ")}>
      <div className="flex items-start justify-between gap-6">
        <UIHeading as="h2" level="h2">
          {title}
        </UIHeading>
        {risk ? (
          <UIBadge variant={risk.variant || "info"}>{risk.label || risk}</UIBadge>
        ) : null}
      </div>

      {scoreLabel || scoreValue ? (
        <div className="mt-3">
          {scoreLabel ? <p className="text-sm text-secondary">{scoreLabel}</p> : null}
          {scoreValue ? <p className="mt-1 text-lg font-semibold text-primary">{scoreValue}</p> : null}
        </div>
      ) : null}

      {highlights?.length ? (
        <>
          <div className="mt-4">
            <UIDivider />
          </div>
          <ul className="mt-4 grid gap-2">
            {highlights.map((h) => (
              <li key={h.key || h} className="text-sm text-secondary">
                {h.label || h}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </UICard>
  );
}


