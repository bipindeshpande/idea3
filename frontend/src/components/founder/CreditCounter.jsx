import UIButton from "../ui/ui-button.jsx";
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
 <p className="text-xs text-secondary mb-1">
 Connections this month
 </p>
 <p className="ui-heading ui-heading--h2 font-bold text-primary">
 {credits.used} / {displayLimit}
 </p>
 <p className="text-xs text-secondary mt-1">
 {tierInfo.label}
 </p>
 {isAtLimit && (
 <p className="text-base text-primary mt-2 font-medium">
 You've reached your connection limit this month.
 </p>
 )}
 </div>
 {tierInfo.showUpgrade && (
 <UIButton onClick={onUpgrade}>
 Upgrade
 </UIButton>
 )}
 </div>
 </Card>
 );
}

