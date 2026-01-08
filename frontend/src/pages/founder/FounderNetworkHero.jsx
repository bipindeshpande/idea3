import { useState } from "react";
import CollapsibleSection from "../../components/ui/CollapsibleSection.jsx";

/**
 * Collapsible info section about the Founder Network
 * Collapsed by default to save space, but accessible when needed
 */
export default function FounderNetworkHero() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <CollapsibleSection
        title="How it works"
        description="Privacy-first networking for founders"
        theme={{ icon: "🤝" }}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      >
        <div className="space-y-3">
          <p className="text-sm text-secondary">
            Find co-founders and collaborators. Your identity stays anonymous until both sides accept a connection.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-start gap-2">
              <span className="text-accent font-semibold">1.</span>
              <div>
                <span className="text-sm font-medium text-primary">Create Profile</span>
                <span className="text-xs text-secondary ml-1 block mt-0.5">List ideas, keep anonymous</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent font-semibold">2.</span>
              <div>
                <span className="text-sm font-medium text-primary">Browse & Filter</span>
                <span className="text-xs text-secondary ml-1 block mt-0.5">Find matches by skills & interests</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent font-semibold">3.</span>
              <div>
                <span className="text-sm font-medium text-primary">Connect</span>
                <span className="text-xs text-secondary ml-1 block mt-0.5">Reveal identities when both accept</span>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

