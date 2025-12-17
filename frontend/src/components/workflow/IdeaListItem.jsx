import UICard from "../ui/ui-card.jsx";
import UIHeading from "../ui/ui-heading.jsx";
import UIBadge from "../ui/ui-badge.jsx";

export default function IdeaListItem({
  title,
  subtitle,
  badges = [],
  right,
  onClick,
  as,
  href,
  className = "",
  ...props
}) {
  const Component = as || (href ? "a" : onClick ? "button" : "div");
  const clickable = Boolean(href || onClick);

  return (
    <UICard
      variant="default"
      className={[
        "ui-pad-md",
        clickable ? "hover:bg-surface-hover transition" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      as={Component}
      href={href}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <UIHeading as="h3" level="h3" className="truncate">
            {title}
          </UIHeading>
          {subtitle ? <p className="mt-1 text-sm text-secondary">{subtitle}</p> : null}
          {badges.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {badges.map((b) => (
                <UIBadge key={b.key || b.label} variant={b.variant || "info"}>
                  {b.label}
                </UIBadge>
              ))}
            </div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </UICard>
  );
}


