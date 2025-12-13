import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";

/**
 * CreditCounter - Displays connection credits with subscription tier messaging
 * 
 * @param {object} credits - Credits object with {used, limit, remaining}
 * @param {string} subscriptionType - User's subscription type
 * @param {Function} onUpgrade - Callback when upgrade button is clicked
 */
export default function CreditCounter({ credits, subscriptionType, onUpgrade }) {
  const getTierInfo = () => {
    const tier = subscriptionType?.toLowerCase() || "free";
    
    if (tier === "free") {
      return {
        limit: 3,
        label: "Free plan · 3 connections/month. Upgrade for more.",
        showUpgrade: credits.used >= 3
      };
    } else if (tier === "starter") {
      return {
        limit: 15,
        label: "Starter plan · 15 connections/month.",
        showUpgrade: credits.used >= 15
      };
    } else if (tier === "pro" || tier === "annual") {
      return {
        limit: 999,
        label: "Unlimited on Pro",
        showUpgrade: false
      };
    }
    return {
      limit: 3,
      label: "Free plan · 3 connections/month. Upgrade for more.",
      showUpgrade: credits.used >= 3
    };
  };

  const tierInfo = getTierInfo();
  const displayLimit = tierInfo.limit === 999 ? "∞" : tierInfo.limit;
  const isAtLimit = credits.used >= tierInfo.limit && tierInfo.limit !== 999;

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">
            Connections this month
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {credits.used} / {displayLimit}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {tierInfo.label}
          </p>
          {isAtLimit && (
            <p className="text-sm text-gray-700 mt-2 font-medium">
              You've reached your connection limit this month.
            </p>
          )}
        </div>
        {tierInfo.showUpgrade && (
          <Button onClick={onUpgrade}>
            Upgrade
          </Button>
        )}
      </div>
    </Card>
  );
}

