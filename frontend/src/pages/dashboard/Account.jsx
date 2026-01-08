import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import LoadingIndicator from "../../components/common/LoadingIndicator.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import UIButton from "../../components/ui/ui-button.jsx";
import FormInput from "../../components/ui/FormInput.jsx";
import FormSelect from "../../components/ui/FormSelect.jsx";
import SectionHeader from "../../components/layout/SectionHeader.jsx";
import { WORKSPACE_TYPOGRAPHY } from "../../components/workspace/WorkspaceTheme.js";
import AccountInformationSection from "../../components/account/AccountInformationSection.jsx";
import AboutYouSection from "../../components/account/AboutYouSection.jsx";
import FrameworkSettingsSection from "../../components/account/FrameworkSettingsSection.jsx";
import ChangePasswordSection from "../../components/account/ChangePasswordSection.jsx";
import SubscriptionSection from "../../components/account/SubscriptionSection.jsx";

export default function AccountPage() {
 const { user, isAuthenticated, subscription, getAuthHeaders, refreshSubscription, changePassword } = useAuth();
 const navigate = useNavigate();
 const [subscriptionData, setSubscriptionData] = useState(null);
 const [paymentHistory, setPaymentHistory] = useState([]);
 const [loading, setLoading] = useState(true);
 const [cancelling, setCancelling] = useState(false);
 const [changing, setChanging] = useState(false);
 const [changingPassword, setChangingPassword] = useState(false);
 const [error, setError] = useState("");
 const [success, setSuccess] = useState("");
 
 // Cancellation modal state
 const [showCancelModal, setShowCancelModal] = useState(false);
 const [selectedReason, setSelectedReason] = useState("");
 const [additionalComments, setAdditionalComments] = useState("");
 
 // Standard cancellation reasons
 const cancellationReasons = [
 { value: "too_expensive", label: "Too expensive" },
 { value: "not_using_enough", label: "Not using it enough" },
 { value: "found_alternative", label: "Found an alternative solution" },
 { value: "missing_features", label: "Missing features I need" },
 { value: "too_complex", label: "Too complex or difficult to use" },
 { value: "not_what_expected", label: "Not what I expected" },
 { value: "temporary_break", label: "Taking a temporary break" },
 { value: "budget_constraints", label: "Budget constraints" },
 { value: "other", label: "Other (please specify)" },
 ];
 
 // Limit additional comments to 500 characters
 const handleCommentsChange = (e) => {
 const value = e.target.value;
 if (value.length <= 500) {
 setAdditionalComments(value);
 }
 };
 
 // Password change form state
 const [passwordForm, setPasswordForm] = useState({
 currentPassword: "",
 newPassword: "",
 confirmPassword: "",
 });
 const [passwordError, setPasswordError] = useState("");
 const [passwordSuccess, setPasswordSuccess] = useState("");
 const [psychologyData, setPsychologyData] = useState(null);
 const [loadingPsychology, setLoadingPsychology] = useState(true);
 const [frameworkTrackingEnabled, setFrameworkTrackingEnabled] = useState(true);
 const [savingPreferences, setSavingPreferences] = useState(false);

 const loadPsychology = useCallback(async () => {
 try {
 setLoadingPsychology(true);
 const response = await fetch("/api/founder/psychology", {
 headers: {
 ...getAuthHeaders(),
 "Content-Type": "application/json"
 }
 });

 if (response.ok) {
 const data = await response.json();
 if (data.success) {
 setPsychologyData(data.data || {});
 }
 }
 } catch (error) {
 console.error("Error loading psychology:", error);
 } finally {
 setLoadingPsychology(false);
 }
  }, [getAuthHeaders]);

  const loadPreferences = async () => {
   if (!user?.preferences) {
    setFrameworkTrackingEnabled(true); // Default to enabled
    return;
   }
   setFrameworkTrackingEnabled(user.preferences.framework_tracking_enabled !== false);
  };

  const handleToggleFrameworkTracking = async (enabled) => {
   setSavingPreferences(true);
   try {
    const response = await fetch("/api/user/preferences", {
     method: "PUT",
     headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
     },
     body: JSON.stringify({
      preferences: {
       framework_tracking_enabled: enabled
      }
     }),
    });

    const data = await response.json();
    if (data.success) {
     setFrameworkTrackingEnabled(enabled);
     setSuccess("Preferences updated successfully");
     // Refresh user data
     if (refreshSubscription) {
      await refreshSubscription();
     }
    } else {
     setError(data.error || "Failed to update preferences");
    }
   } catch (error) {
    setError("Failed to update preferences. Please try again.");
   } finally {
    setSavingPreferences(false);
   }
  };

  useEffect(() => {
   if (!isAuthenticated) {
    navigate("/login", { state: { from: { pathname: "/account" } } });
    return;
   }
   // Clear any previous errors when component mounts
   setError("");
   setSuccess("");
   loadSubscription();
   loadPsychology();
   loadPreferences();
  }, [isAuthenticated, navigate, loadPsychology, user]);

 const loadSubscription = async () => {
 try {
 setError(""); // Clear any previous errors
 const response = await fetch("/api/subscription/status", {
 headers: getAuthHeaders(),
 });
 if (response.ok) {
 const data = await response.json();
 if (data.success) {
 setSubscriptionData(data.subscription);
 setPaymentHistory(data.payment_history || []);
 } else {
 setError(data.error || "Failed to load subscription information");
 }
 } else {
 const errorData = await response.json().catch(() => ({}));
 setError(errorData.error || `Failed to load subscription (${response.status})`);
 }
 } catch (error) {
 console.error("Failed to load subscription:", error);
 setError("Unable to connect to server. Please check your connection and try again.");
 } finally {
 setLoading(false);
 }
 };

 const handleCancelClick = () => {
 setShowCancelModal(true);
 setSelectedReason("");
 setAdditionalComments("");
 setError("");
 };

 const handleCancelConfirm = async () => {
 if (!selectedReason) {
 setError("Please select a reason for cancellation");
 return;
 }

 // If "other" is selected, require additional comments
 if (selectedReason === "other" && !additionalComments.trim()) {
 setError("Please provide details for 'Other' reason");
 return;
 }

 setCancelling(true);
 setError("");
 setSuccess("");

 try {
 // Build cancellation reason text
 const selectedReasonLabel = cancellationReasons.find(r => r.value === selectedReason)?.label || selectedReason;
 let cancellationReasonText = selectedReasonLabel;
 
 if (additionalComments.trim()) {
 cancellationReasonText += `: ${additionalComments.trim()}`;
 }

 const response = await fetch("/api/subscription/cancel", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 ...getAuthHeaders(),
 },
 body: JSON.stringify({
 cancellation_reason: cancellationReasonText,
 cancellation_category: selectedReason,
 additional_comments: additionalComments.trim() || null,
 }),
 });

 const data = await response.json();
 if (data.success) {
 setSuccess("Subscription cancelled. You'll have access until expiration.");
 setShowCancelModal(false);
 setSelectedReason("");
 setAdditionalComments("");
 await refreshSubscription();
 await loadSubscription();
 } else {
 setError(data.error || "Failed to cancel subscription");
 }
 } catch (error) {
 setError("An error occurred. Please try again.");
 } finally {
 setCancelling(false);
 }
 };

 const handleChangePlan = async (newPlan) => {
 const planNames = {
 starter: "Starter ($7/month)",
 pro: "Pro ($15/month)",
 weekly: "Weekly ($5/week)",
 };
 const planDisplay = planNames[newPlan] || `${newPlan} plan`;
 if (!window.confirm(`Switch to ${planDisplay}?`)) {
 return;
 }

 setChanging(true);
 setError("");
 setSuccess("");

 try {
 const response = await fetch("/api/subscription/change-plan", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 ...getAuthHeaders(),
 },
 body: JSON.stringify({ subscription_type: newPlan }),
 });

 const data = await response.json();
 if (data.success) {
 const planNames = {
 free: "Free",
 starter: "Starter",
 pro: "Pro",
 weekly: "Weekly",
 monthly: "Pro", // Legacy
 };
 const displayName = planNames[newPlan] || newPlan;
 setSuccess(`Subscription changed to ${displayName} plan successfully.`);
 await refreshSubscription();
 await loadSubscription();
 } else {
 setError(data.error || "Failed to change subscription");
 }
 } catch (error) {
 setError("An error occurred. Please try again.");
 } finally {
 setChanging(false);
 }
 };

 const handlePasswordChange = async (e) => {
 e.preventDefault();
 setPasswordError("");
 setPasswordSuccess("");

 // Validation
 if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
 setPasswordError("All fields are required");
 return;
 }

 if (passwordForm.newPassword.length < 8) {
 setPasswordError("New password must be at least 8 characters");
 return;
 }

 if (passwordForm.newPassword !== passwordForm.confirmPassword) {
 setPasswordError("New passwords do not match");
 return;
 }

 if (passwordForm.currentPassword === passwordForm.newPassword) {
 setPasswordError("New password must be different from current password");
 return;
 }

 setChangingPassword(true);

 try {
 const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
 
 if (result.success) {
 setPasswordSuccess("Password changed successfully");
 setPasswordForm({
 currentPassword: "",
 newPassword: "",
 confirmPassword: "",
 });
 } else {
 setPasswordError(result.error || "Failed to change password");
 }
 } catch (error) {
 setPasswordError("An error occurred. Please try again.");
 } finally {
 setChangingPassword(false);
 }
 };

 // Map subscription types to display names and prices
 const getPlanInfo = (type) => {
 if (!type) return { name: "Free", price: "Free" };
 switch (type) {
 case "free":
 return { name: "Free", price: "$0 forever" };
 case "starter":
 return { name: "Starter", price: "$7/month" };
 case "pro":
 return { name: "Pro", price: "$15/month" };
 case "weekly":
 return { name: "Weekly", price: "$5/week" };
 case "monthly": // Legacy
 return { name: "Pro", price: "$15/month" };
 case "free_trial": // Legacy
 return { name: "Free", price: "Free" };
 default:
 return { name: type || "Free", price: "Free" };
 }
 };

 if (loading) {
 return (
 <PageContainer>
 <LoadingIndicator simple={true} message="Loading account details..." />
 </PageContainer>
 );
 }
 
 const planInfo = getPlanInfo(subscriptionData?.type);
 const planName = planInfo.name;
 const planPrice = planInfo.price;
 const canCancel = subscriptionData?.type && subscriptionData?.type !== "free" && subscriptionData?.type !== "free_trial" && subscriptionData?.status === "active";
 const canChange = subscriptionData?.type && subscriptionData?.type !== "free" && subscriptionData?.type !== "free_trial" && subscriptionData?.status === "active";

 return (
 <PageContainer>
 <Seo
 title="Account Settings | Startup Idea Advisor"
 description="Manage your account settings, subscription, and password."
 path="/account"
 />


{error && (
<Card className="mb-6 border-default bg-surface">
<p className={WORKSPACE_TYPOGRAPHY.bodySmall + " text-accent"}>{error}</p>
</Card>
)}

{success && (
<Card className="mb-6 border-default bg-surface">
<p className={WORKSPACE_TYPOGRAPHY.bodySmall + " text-accent"}>{success}</p>
</Card>
)}

 {/* User Information */}
 <AccountInformationSection user={user} getPlanInfo={getPlanInfo} />

 {/* About You */}
 <AboutYouSection psychologyData={psychologyData} />

 {/* Framework Settings */}
 <FrameworkSettingsSection
   frameworkTrackingEnabled={frameworkTrackingEnabled}
   savingPreferences={savingPreferences}
   onToggle={handleToggleFrameworkTracking}
 />

 {/* Change Password */}
 <ChangePasswordSection
   passwordForm={passwordForm}
   setPasswordForm={setPasswordForm}
   passwordError={passwordError}
   passwordSuccess={passwordSuccess}
   changingPassword={changingPassword}
   onSubmit={handlePasswordChange}
 />

 {/* Subscription Management */}
 <SubscriptionSection
   subscriptionData={subscriptionData}
   getPlanInfo={getPlanInfo}
   canChange={canChange}
   canCancel={canCancel}
   changing={changing}
   cancelling={cancelling}
   onCancelClick={handleCancelClick}
   onChangePlan={handleChangePlan}
 />

 {/* Payment History */}
 {paymentHistory.length > 0 && (
 <Card className="mt-6">
 <SectionHeader title="Payment History" className="mb-6" />
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-default">
 <th className={`px-4 py-3 text-left ${WORKSPACE_TYPOGRAPHY.label}`}>Date</th>
 <th className={`px-4 py-3 text-left ${WORKSPACE_TYPOGRAPHY.label}`}>Amount</th>
 <th className={`px-4 py-3 text-left ${WORKSPACE_TYPOGRAPHY.label}`}>Plan</th>
 <th className={`px-4 py-3 text-left ${WORKSPACE_TYPOGRAPHY.label}`}>Status</th>
 </tr>
 </thead>
 <tbody>
 {paymentHistory.map((payment) => (
 <tr key={payment.id} className="border-b border-default">
 <td className={`px-4 py-3 ${WORKSPACE_TYPOGRAPHY.bodySmall} text-secondary`}>
 {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "—"}
 </td>
 <td className={`px-4 py-3 ${WORKSPACE_TYPOGRAPHY.label}`}>
 {payment.amount != null && typeof payment.amount === 'number' 
 ? `$${payment.amount.toFixed(2)}` 
 : payment.amount != null 
 ? `$${Number(payment.amount).toFixed(2)}` 
 : "—"}
 </td>
 <td className={`px-4 py-3 ${WORKSPACE_TYPOGRAPHY.bodySmall} text-secondary capitalize`}>{payment.subscription_type}</td>
 <td className="px-4 py-3">
<span className={`rounded-full bg-surface px-3 py-1 ${WORKSPACE_TYPOGRAPHY.caption} font-semibold text-accent`}>
Completed
</span>
</td>
</tr>
))}
</tbody>
</table>
</div>
</Card>
)}

{/* Cancellation Reason Modal */}
{showCancelModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-light p-4">
<Card className="w-full shadow-xl">
<SectionHeader title="Cancel Subscription" className="mb-4" />
<p className={`mb-6 ${WORKSPACE_TYPOGRAPHY.subtitle}`}>
We're sorry to see you go. Your subscription will remain active until{" "}
{subscriptionData?.expires_at ? new Date(subscriptionData.expires_at).toLocaleDateString() : "the expiration date"}.
Please let us know why you're canceling so we can improve.
</p>
 
<div className="mb-6">
<label htmlFor="cancellation-reason" className={`block ${WORKSPACE_TYPOGRAPHY.label} mb-2`}>
Reason for Cancellation <span className="text-accent">*</span>
</label>
 <FormSelect
 id="cancellation-reason"
 value={selectedReason}
 onChange={(e) => setSelectedReason(e.target.value)}
 required
 >
 <option value="">Select a reason...</option>
 {cancellationReasons.map((reason) => (
 <option key={reason.value} value={reason.value}>
 {reason.label}
 </option>
 ))}
 </FormSelect>
 </div>

<div className="mb-6">
<label htmlFor="additional-comments" className={`block ${WORKSPACE_TYPOGRAPHY.label} mb-2`}>
Additional Comments {selectedReason === "other" && <span className="text-accent">*</span>}
{selectedReason && selectedReason !== "other" && <span className={`${WORKSPACE_TYPOGRAPHY.caption} font-normal`}>(Optional)</span>}
</label>
 <textarea
 id="additional-comments"
 value={additionalComments}
 onChange={handleCommentsChange}
 placeholder={selectedReason === "other" ? "Please provide details..." : "Any additional feedback (optional)"}
 rows={4}
 className="ui-textarea w-full ui-radius-input ui-pad-sm focus-visible:outline-accent"
 required={selectedReason === "other"}
 maxLength={500}
 />
 <p className={`mt-2 ${WORKSPACE_TYPOGRAPHY.caption}`}>
 {additionalComments.length}/500 characters
 </p>
 </div>

{error && (
<Card className="mb-4 border-default bg-surface">
<p className={`${WORKSPACE_TYPOGRAPHY.bodySmall} text-accent`}>{error}</p>
</Card>
)}

 <div className="flex gap-3">
 <UIButton
 onClick={() => {
 setShowCancelModal(false);
 setSelectedReason("");
 setAdditionalComments("");
 setError("");
 }}
 disabled={cancelling}
 variant="secondary"
 className="flex-1"
 >
 Keep Subscription
 </UIButton>
 <UIButton
 onClick={handleCancelConfirm}
 disabled={cancelling || !selectedReason || (selectedReason === "other" && !additionalComments.trim())}
 variant="secondary"
 className="flex-1 border-default text-accent hover:bg-surface"
 >
 {cancelling ? "Cancelling..." : "Confirm Cancellation"}
 </UIButton>
 </div>
 </Card>
 </div>
 )}
 </PageContainer>
 );
}

