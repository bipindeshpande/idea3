import { Link } from "react-router-dom";
import UIBadge from "../ui/ui-badge.jsx";

/**
 * Sticky sidebar for recommendation detail page
 * Shows quick facts, actions, and top risks
 */
export default function RecommendationSidebar({
  activeIdea,
  heroChips,
  riskRows,
  onValidate,
  onSave,
  validating,
  isAuthenticated
}) {
  // Extract quick facts from heroChips
  const timeline = heroChips?.find(chip => chip.label?.toLowerCase().includes('timeline') || chip.label?.toLowerCase().includes('month'))?.label;
  const budget = heroChips?.find(chip => chip.label?.toLowerCase().includes('budget') || chip.label?.includes('$'))?.label;
  const difficulty = heroChips?.find(chip => chip.label?.toLowerCase().includes('difficulty') || chip.label?.toLowerCase().includes('effort'))?.label;
  
  // Get top 3 risks
  const topRisks = riskRows?.slice(0, 3) || [];

  return (
    <aside className="lg:w-80 flex-shrink-0">
      <div className="lg:sticky lg:top-4 space-y-4">
        {/* Quick Facts Card */}
        <div className="bg-surface rounded-xl p-5 border border-divider shadow-sm">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
            📊 At a Glance
          </h3>
          
          <div className="space-y-3">
            {timeline && (
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <div className="text-xs text-secondary uppercase tracking-wide">Timeline</div>
                  <div className="text-sm font-medium text-primary">{timeline}</div>
                </div>
              </div>
            )}
            
            {budget && (
              <div className="flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <div className="text-xs text-secondary uppercase tracking-wide">Budget</div>
                  <div className="text-sm font-medium text-primary">{budget}</div>
                </div>
              </div>
            )}
            
            {difficulty && (
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="text-xs text-secondary uppercase tracking-wide">Effort</div>
                  <div className="text-sm font-medium text-primary">{difficulty}</div>
                </div>
              </div>
            )}

            {/* If no hero chips, show basic info */}
            {!timeline && !budget && !difficulty && activeIdea && (
              <div className="text-sm text-secondary">
                <p>Quick facts loading...</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Risks Card */}
        {topRisks.length > 0 && (
          <div className="bg-surface rounded-xl p-5 border border-divider shadow-sm">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
              ⚠️ Top Risks
            </h3>
            
            <div className="space-y-3">
              {topRisks.map((risk, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {risk.severity === 'HIGH' && <span className="text-red-500">🔴</span>}
                    {risk.severity === 'MEDIUM' && <span className="text-yellow-500">🟡</span>}
                    {risk.severity === 'LOW' && <span className="text-green-500">🟢</span>}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-primary">{risk.risk}</div>
                    {risk.severity && (
                      <UIBadge variant={
                        risk.severity === 'HIGH' ? 'danger' :
                        risk.severity === 'MEDIUM' ? 'warning' : 'success'
                      } size="xs" className="mt-1">
                        {risk.severity}
                      </UIBadge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-divider">
              <a href="#validation" className="text-xs text-accent hover:underline">
                View all risks →
              </a>
            </div>
          </div>
        )}

        {/* Quick Actions Card */}
        <div className="bg-surface rounded-xl p-5 border border-divider shadow-sm">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
            ✅ Actions
          </h3>
          
          <div className="space-y-2">
            {isAuthenticated && activeIdea && (
              <>
                <button
                  onClick={onValidate}
                  disabled={validating}
                  className="w-full ui-btn ui-btn-primary text-sm py-2"
                >
                  {validating ? "Validating..." : "🔍 Validate Idea"}
                </button>
                
                <button
                  onClick={onSave}
                  className="w-full ui-btn ui-btn-secondary text-sm py-2"
                >
                  🔖 Save for Later
                </button>
                
                <Link
                  to="/dashboard/compare"
                  state={{ ideaToCompare: activeIdea }}
                  className="w-full ui-btn ui-btn-secondary text-sm py-2 text-center block"
                >
                  ⚖️ Compare Ideas
                </Link>
              </>
            )}
            
            {!isAuthenticated && (
              <div className="text-sm text-secondary text-center py-2">
                <Link to="/login" className="text-accent hover:underline">
                  Login
                </Link>
                {" to save and validate"}
              </div>
            )}
          </div>
        </div>

        {/* Notes Section (Placeholder) */}
        {isAuthenticated && (
          <div className="bg-surface rounded-xl p-5 border border-divider shadow-sm">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
              📝 Quick Notes
            </h3>
            
            <textarea
              placeholder="Jot down thoughts about this idea..."
              className="w-full ui-field text-sm min-h-[100px] resize-none"
              rows={4}
            />
            
            <button className="mt-2 w-full ui-btn ui-btn-secondary text-xs py-1.5">
              Save Note
            </button>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-secondary text-center px-4">
          <p>💡 Tip: Use tabs above to explore different aspects of this opportunity</p>
        </div>
      </div>
    </aside>
  );
}

