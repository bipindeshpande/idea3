import { useState } from "react";
import CollapsibleSection from "../../components/ui/CollapsibleSection.jsx";

/**
 * Collapsible info section about the discovery process
 * Collapsed by default to save space, but accessible when needed
 */
export default function DiscoveryHero() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <CollapsibleSection
        title="What you'll get"
        description="Personalized startup ideas matched to your profile"
        theme={{ icon: "💡" }}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      >
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <span className="text-accent font-semibold">•</span>
              <div>
                <span className="text-sm font-medium text-primary">Ranked Ideas</span>
                <span className="text-xs text-secondary ml-1">— Scored by fit, time, budget, skills</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent font-semibold">•</span>
              <div>
                <span className="text-sm font-medium text-primary">Financial Analysis</span>
                <span className="text-xs text-secondary ml-1">— Costs, revenue, breakeven</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent font-semibold">•</span>
              <div>
                <span className="text-sm font-medium text-primary">Profile Summary</span>
                <span className="text-xs text-secondary ml-1">— Your strengths & constraints</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent font-semibold">•</span>
              <div>
                <span className="text-sm font-medium text-primary">Risk Assessment</span>
                <span className="text-xs text-secondary ml-1">— Risks & mitigation strategies</span>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

