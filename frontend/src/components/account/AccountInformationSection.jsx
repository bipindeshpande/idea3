import Card from "../ui/Card.jsx";
import SectionHeader from "../layout/SectionHeader.jsx";
import { WORKSPACE_TYPOGRAPHY } from "../workspace/WorkspaceTheme.js";

/**
 * Account Information section showing user email, status, and subscription type
 */
export default function AccountInformationSection({ user, getPlanInfo }) {
  return (
    <Card className="mt-6">
      <SectionHeader title="Account Information" className="mb-6" />
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className={WORKSPACE_TYPOGRAPHY.statLabel}>Email</p>
          <p className={`mt-2 ${WORKSPACE_TYPOGRAPHY.body}`}>{user?.email || "—"}</p>
        </div>
        <div>
          <p className={WORKSPACE_TYPOGRAPHY.statLabel}>Account Status</p>
          <p className={`mt-2 ${WORKSPACE_TYPOGRAPHY.body}`}>
            {user?.is_active ? "Active" : "Inactive"}
          </p>
        </div>
        {user?.subscription_type && (
          <div>
            <p className={WORKSPACE_TYPOGRAPHY.statLabel}>Subscription Type</p>
            <p className={`mt-2 ${WORKSPACE_TYPOGRAPHY.body} capitalize`}>
              {getPlanInfo(user.subscription_type).name}
            </p>
          </div>
        )}
        {user?.subscription_expires_at && (
          <div>
            <p className={WORKSPACE_TYPOGRAPHY.statLabel}>Subscription Expires</p>
            <p className={`mt-2 ${WORKSPACE_TYPOGRAPHY.body}`}>
              {new Date(user.subscription_expires_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

