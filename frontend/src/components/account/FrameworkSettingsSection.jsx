import Card from "../ui/Card.jsx";
import SectionHeader from "../layout/SectionHeader.jsx";
import { WORKSPACE_TYPOGRAPHY } from "../workspace/WorkspaceTheme.js";

/**
 * Framework Settings section with toggle for framework tracking
 */
export default function FrameworkSettingsSection({
  frameworkTrackingEnabled,
  savingPreferences,
  onToggle
}) {
  return (
    <Card className="mt-6">
      <SectionHeader title="Framework Settings" className="mb-6" />
      
      <div className="flex items-center justify-between py-4 border-b border-default">
        <div>
          <p className={WORKSPACE_TYPOGRAPHY.h4}>Enable Framework Tracking</p>
          <p className={`mt-1 ${WORKSPACE_TYPOGRAPHY.subtitle}`}>
            When enabled, you can create and manage validation frameworks in your workspace.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={frameworkTrackingEnabled}
            onChange={(e) => onToggle(e.target.checked)}
            disabled={savingPreferences}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </Card>
  );
}

