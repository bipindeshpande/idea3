import UIButton from "../ui/ui-button.jsx";
import UICard from "../ui/ui-card.jsx";
import UIHeading from "../ui/ui-heading.jsx";

/**
 * QuickActions
 * - Presentational-only (no business logic)
 * - Accepts actions as either onClick or href (caller decides)
 */
export default function QuickActions({ title = "Quick actions", actions = [], className = "" }) {
  return (
    <UICard className={["ui-pad-md", className].filter(Boolean).join(" ")}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <UIHeading as="h2" level="h2">
            {title}
          </UIHeading>
          <p className="mt-1 text-sm text-secondary">Jump back in with a single click.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {actions.map((a) => {
          const Component = a.as || (a.href ? "a" : "button");
          return (
            <UIButton
              key={a.key || a.label}
              as={Component}
              href={a.href}
              onClick={a.onClick}
              variant={a.variant || "primary"}
              className={a.className}
              {...(a.props || {})}
            >
              {a.label}
            </UIButton>
          );
        })}
      </div>
    </UICard>
  );
}


