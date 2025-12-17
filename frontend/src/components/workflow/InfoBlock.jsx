import UICard from "../ui/ui-card.jsx";
import UIBadge from "../ui/ui-badge.jsx";

export default function InfoBlock({ variant = "info", children, className = "" }) {
  return (
    <UICard variant="muted" className={`p-4 ${className}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <UIBadge variant={variant}>{variant.toUpperCase()}</UIBadge>
        <div className="text-secondary">{children}</div>
      </div>
    </UICard>
  );
}


