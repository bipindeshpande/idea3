import { Link } from "react-router-dom";
import UIBadge from "../ui/ui-badge.jsx";

/**
 * At a Glance tab - Quick overview with key facts, risks, and actions
 */
export default function AtAGlanceTab({
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
  
  // Get top risks
  const topRisks = riskRows?.slice(0, 5) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
      {/* Quick Facts Card */}
      <div className="bg-surface rounded-xl p-4 sm:p-6 border border-divider shadow-sm hover:shadow-md transition-shadow duration-200">
        <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          <span>Key Metrics</span>
        </h3>
        
        <div className="space-y-4">
          {timeline && (
            <div className="flex items-start gap-3">
              <span className="text-3xl">⏱️</span>
              <div>
                <div className="text-xs text-secondary uppercase tracking-wide">Timeline</div>
                <div className="text-base font-medium text-primary">{timeline}</div>
              </div>
            </div>
          )}
          
          {budget && (
            <div className="flex items-start gap-3">
              <span className="text-3xl">💰</span>
              <div>
                <div className="text-xs text-secondary uppercase tracking-wide">Budget</div>
                <div className="text-base font-medium text-primary">{budget}</div>
              </div>
            </div>
          )}
          
          {difficulty && (
            <div className="flex items-start gap-3">
              <span className="text-3xl">⚡</span>
              <div>
                <div className="text-xs text-secondary uppercase tracking-wide">Effort Level</div>
                <div className="text-base font-medium text-primary">{difficulty}</div>
              </div>
            </div>
          )}

          {!timeline && !budget && !difficulty && (
            <div className="text-sm text-secondary">
              <p>Analyzing key metrics...</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Risks Card */}
      <div className="bg-surface rounded-xl p-4 sm:p-6 border border-divider shadow-sm hover:shadow-md transition-shadow duration-200 md:col-span-2">
        <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <span>Key Risks to Consider</span>
        </h3>
        
        {topRisks.length > 0 ? (
          <div className="space-y-3">
            {topRisks.map((risk, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background">
                <div className="flex-shrink-0 mt-0.5">
                  {risk.severity === 'HIGH' && <span className="text-xl">🔴</span>}
                  {risk.severity === 'MEDIUM' && <span className="text-xl">🟡</span>}
                  {risk.severity === 'LOW' && <span className="text-xl">🟢</span>}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-primary mb-1">{risk.risk}</div>
                  {risk.mitigation && (
                    <div className="text-xs text-secondary">
                      <span className="font-semibold">Mitigation:</span> {risk.mitigation}
                    </div>
                  )}
                  {risk.severity && (
                    <UIBadge variant={
                      risk.severity === 'HIGH' ? 'danger' :
                      risk.severity === 'MEDIUM' ? 'warning' : 'success'
                    } size="xs" className="mt-2">
                      {risk.severity} SEVERITY
                    </UIBadge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-secondary">
            <p>Risk analysis will be available once content loads.</p>
          </div>
        )}
      </div>

      {/* Quick Actions Card */}
      <div className="bg-surface rounded-xl p-6 border border-divider shadow-sm">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          ✅ Quick Actions
        </h3>
        
        <div className="space-y-3">
          {isAuthenticated && activeIdea ? (
            <>
              <button
                onClick={onValidate}
                disabled={validating}
                className="w-full ui-btn ui-btn-primary"
              >
                {validating ? "Validating..." : "🔍 Validate This Idea"}
              </button>
              
              <button
                onClick={onSave}
                className="w-full ui-btn ui-btn-secondary"
              >
                🔖 Save for Later
              </button>
              
              <Link
                to="/dashboard/compare"
                state={{ ideaToCompare: activeIdea }}
                className="w-full ui-btn ui-btn-secondary text-center block"
              >
                ⚖️ Compare with Others
              </Link>
            </>
          ) : (
            <div className="text-sm text-secondary text-center py-4">
              <Link to="/login" className="text-accent hover:underline font-medium">
                Login
              </Link>
              {" to save, validate, and compare ideas"}
            </div>
          )}
        </div>
      </div>

      {/* Quick Notes Card */}
      {isAuthenticated && (
        <div className="bg-surface rounded-xl p-6 border border-divider shadow-sm md:col-span-2">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            📝 Your Notes
          </h3>
          
          <textarea
            placeholder="Jot down your thoughts about this opportunity..."
            className="w-full ui-field min-h-[120px] resize-none mb-3"
            rows={5}
          />
          
          <button className="ui-btn ui-btn-primary">
            Save Note
          </button>
        </div>
      )}

      {/* Help Card */}
      <div className="bg-accent/5 rounded-xl p-6 border border-accent/20 lg:col-span-3">
        <div className="flex items-start gap-4">
          <span className="text-4xl">💡</span>
          <div>
            <h4 className="text-base font-semibold text-primary mb-2">Quick Guide</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Use the <strong>Overview</strong> tab for detailed analysis and financial info</li>
              <li>• Check <strong>Validation & Risks</strong> for due diligence questions</li>
              <li>• Review <strong>Execution</strong> for step-by-step implementation</li>
              <li>• Explore <strong>Market Intel</strong> for customer and market insights</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

