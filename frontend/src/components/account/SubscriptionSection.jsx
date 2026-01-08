import { Link } from "react-router-dom";
import Card from "../ui/Card.jsx";
import SectionHeader from "../layout/SectionHeader.jsx";
import UIButton from "../ui/ui-button.jsx";
import { WORKSPACE_TYPOGRAPHY } from "../workspace/WorkspaceTheme.js";

/**
 * Subscription Management section
 */
export default function SubscriptionSection({
  subscriptionData,
  getPlanInfo,
  canChange,
  canCancel,
  changing,
  cancelling,
  onCancelClick,
  onChangePlan
}) {
  if (!subscriptionData) {
    return (
      <Card className="mb-8 text-center">
        <p className="text-secondary">No active subscription found.</p>
        <UIButton as={Link} to="/pricing" className="mt-4">
          View Pricing Plans
        </UIButton>
      </Card>
    );
  }

  const planInfo = getPlanInfo(subscriptionData.type);
  const planName = planInfo.name;
  const planPrice = planInfo.price;

  return (
    <Card className="mt-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <SectionHeader title="Subscription" description="Manage your subscription plan" />
        </div>
        <div className={`rounded-full px-4 py-2 ${WORKSPACE_TYPOGRAPHY.label} ${
          subscriptionData.is_active
            ? "bg-surface text-accent"
            : "bg-surface text-primary"
        }`}>
          {subscriptionData.is_active ? "Active" : subscriptionData.status}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className={WORKSPACE_TYPOGRAPHY.statLabel}>Plan</p>
          <p className={`mt-2 ${WORKSPACE_TYPOGRAPHY.statValue}`}>{planName}</p>
          <p className={`mt-1 ${WORKSPACE_TYPOGRAPHY.subtitle}`}>{planPrice}</p>
        </div>
        <div>
          <p className={WORKSPACE_TYPOGRAPHY.statLabel}>Status</p>
          <p className={`mt-2 ${WORKSPACE_TYPOGRAPHY.h4} capitalize`}>{subscriptionData.status}</p>
          {subscriptionData.is_active && subscriptionData.days_remaining !== null && (
            <p className={`mt-1 ${WORKSPACE_TYPOGRAPHY.subtitle}`}>
              {subscriptionData.days_remaining} {subscriptionData.days_remaining === 1 ? "day" : "days"} remaining
            </p>
          )}
        </div>
        {subscriptionData.expires_at && (
          <div>
            <p className={WORKSPACE_TYPOGRAPHY.statLabel}>Expires</p>
            <p className={`mt-2 ${WORKSPACE_TYPOGRAPHY.h4}`}>
              {new Date(subscriptionData.expires_at).toLocaleDateString()}
            </p>
          </div>
        )}
        {subscriptionData.started_at && (
          <div>
            <p className={WORKSPACE_TYPOGRAPHY.statLabel}>Started</p>
            <p className={`mt-2 ${WORKSPACE_TYPOGRAPHY.h4}`}>
              {new Date(subscriptionData.started_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {canChange && (
        <div className="mt-8 border-t border-default pt-6">
          <SectionHeader title="Change Plan" className="mb-4" />
          <p className={`mb-4 ${WORKSPACE_TYPOGRAPHY.subtitle}`}>
            Switch to a different plan. Your current plan will remain active until the end of the billing period.
          </p>
          <div className="flex flex-wrap gap-4">
            {subscriptionData.type !== "starter" && (
              <UIButton
                onClick={() => onChangePlan("starter")}
                disabled={changing}
                variant="secondary"
              >
                {changing ? "Processing..." : "Switch to Starter ($7/month)"}
              </UIButton>
            )}
            {subscriptionData.type !== "pro" && subscriptionData.type !== "monthly" && (
              <UIButton
                onClick={() => onChangePlan("pro")}
                disabled={changing}
                variant="secondary"
              >
                {changing ? "Processing..." : "Switch to Pro ($15/month)"}
              </UIButton>
            )}
            {subscriptionData.type !== "weekly" && (
              <UIButton
                onClick={() => onChangePlan("weekly")}
                disabled={changing}
                variant="secondary"
              >
                {changing ? "Processing..." : "Switch to Weekly ($5/week)"}
              </UIButton>
            )}
            {subscriptionData.type === "monthly" && (
              <UIButton
                onClick={() => onChangePlan("pro")}
                disabled={changing}
                variant="secondary"
              >
                {changing ? "Processing..." : "Switch to Pro ($15/month)"}
              </UIButton>
            )}
          </div>
        </div>
      )}

      {canCancel && (
        <div className="mt-6 border-t border-default pt-6">
          <SectionHeader title="Cancel Subscription" className="mb-4" />
          <p className={`mb-4 ${WORKSPACE_TYPOGRAPHY.subtitle}`}>
            You'll continue to have access to all features until your subscription expires on{" "}
            {subscriptionData.expires_at ? new Date(subscriptionData.expires_at).toLocaleDateString() : "the expiration date"}.
          </p>
          <UIButton
            onClick={onCancelClick}
            disabled={cancelling}
            variant="secondary"
            className="border-default text-accent hover:bg-surface"
          >
            Cancel Subscription
          </UIButton>
        </div>
      )}

      {!subscriptionData.is_active && (
        <div className="mt-6">
          <UIButton as={Link} to="/pricing">
            Resubscribe
          </UIButton>
        </div>
      )}
    </Card>
  );
}

