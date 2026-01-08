import { Link } from "react-router-dom";
import Card from "../ui/Card.jsx";
import SectionHeader from "../layout/SectionHeader.jsx";
import UIButton from "../ui/ui-button.jsx";
import { WORKSPACE_TYPOGRAPHY } from "../workspace/WorkspaceTheme.js";

/**
 * About You section with Decision & Work Style and Founder Profile cards
 */
export default function AboutYouSection({ psychologyData }) {
  return (
    <Card className="mt-6">
      <SectionHeader
        title="About You"
        description="Complete assessments to personalize your experience"
        className="mb-4"
      />
      
      {/* Decision & Work Style Card */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <SectionHeader title="Decision & Work Style" />
            <p className={`mt-1 ${WORKSPACE_TYPOGRAPHY.subtitle}`}>
              Used by the system to personalize and explain startup recommendations.
            </p>
          </div>
          <UIButton as={Link} to="/psyche/questionnaire" variant="secondary" className="whitespace-nowrap">
            Complete Assessment
          </UIButton>
        </div>
        <div className="flex items-center justify-between">
          <p className={WORKSPACE_TYPOGRAPHY.caption}>Takes about 3–4 minutes</p>
          <Link
            to="/psyche/profile?details=true"
            className={`${WORKSPACE_TYPOGRAPHY.caption} hover:text-primary transition`}
          >
            View Details (Advanced)
          </Link>
        </div>
      </Card>

      {/* Founder Profile Card */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <SectionHeader title="Founder Profile" />
            <p className={`mt-1 ${WORKSPACE_TYPOGRAPHY.subtitle}`}>
              Helps other founders understand your background, interests, and goals.
            </p>
          </div>
          <UIButton as={Link} to="/founder-psychology" variant="secondary">
            {psychologyData?.archetype ? "Edit Profile" : "Add Profile"}
          </UIButton>
        </div>
      </Card>
    </Card>
  );
}

