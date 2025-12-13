import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import LoadingIndicator from "../../components/common/LoadingIndicator.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import FormInput from "../../components/ui/FormInput.jsx";
import FormSelect from "../../components/ui/FormSelect.jsx";
import SectionHeader from "../../components/layout/SectionHeader.jsx";

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
  }, [isAuthenticated, navigate, loadPsychology]);

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

      <div className="mb-8 relative">
        <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-indigo-300 opacity-[0.09] blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <PageHeader
            title="Account Settings"
            description="Manage your account information and subscription"
          />
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </Card>
      )}

      {success && (
        <Card className="mb-6 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30">
          <p className="text-sm text-emerald-800 dark:text-emerald-300">{success}</p>
        </Card>
      )}

      {/* User Information */}
      <Card className="mt-10 md:mt-12">
        <SectionHeader title="Account Information" className="mb-6" />
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-600 dark:text-slate-400 uppercase tracking-wide">Email</p>
            <p className="mt-2 text-[15px] text-gray-700 dark:text-slate-300 leading-relaxed">{user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-slate-400 uppercase tracking-wide">Account Status</p>
            <p className="mt-2 text-[15px] text-gray-700 dark:text-slate-300 leading-relaxed">
              {user?.is_active ? "Active" : "Inactive"}
            </p>
          </div>
          {user?.subscription_type && (
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400 uppercase tracking-wide">Subscription Type</p>
              <p className="mt-2 text-[15px] text-gray-700 dark:text-slate-300 leading-relaxed capitalize">
                {getPlanInfo(user.subscription_type).name}
              </p>
            </div>
          )}
          {user?.subscription_expires_at && (
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400 uppercase tracking-wide">Subscription Expires</p>
              <p className="mt-2 text-[15px] text-gray-700 dark:text-slate-300 leading-relaxed">
                {new Date(user.subscription_expires_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* About You */}
      <Card className="mt-10 md:mt-12">
        <SectionHeader
          title="About You"
          description="Complete assessments to personalize your experience"
          className="mb-6"
        />
        
        {/* Decision & Work Style Card */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <SectionHeader title="Decision & Work Style" className="text-lg" />
              <p className="mt-1 text-[15px] text-gray-700 dark:text-slate-300 leading-relaxed">Used by the system to personalize and explain startup recommendations.</p>
            </div>
            <Button as={Link} to="/psyche/questionnaire" variant="secondary" className="whitespace-nowrap">
              Complete Assessment
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600 dark:text-slate-400">Takes about 3–4 minutes</p>
            <Link
              to="/psyche/profile?details=true"
              className="text-xs text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-400 transition"
            >
              View Details (Advanced)
            </Link>
          </div>
        </Card>

        {/* Founder Profile Card */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <SectionHeader title="Founder Profile" className="text-lg" />
              <p className="mt-1 text-[15px] text-gray-700 dark:text-slate-300 leading-relaxed">Helps other founders understand your background, interests, and goals.</p>
            </div>
            <Button as={Link} to="/founder-psychology" variant="secondary">
              {psychologyData?.archetype ? "Edit Profile" : "Add Profile"}
            </Button>
          </div>
        </Card>
      </Card>

      {/* Change Password */}
      <Card className="mt-10 md:mt-12">
        <SectionHeader title="Change Password" className="mb-6" />
        
        {passwordError && (
          <Card className="mb-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30">
            <p className="text-sm text-red-800 dark:text-red-300">{passwordError}</p>
          </Card>
        )}

        {passwordSuccess && (
          <Card className="mb-4 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30">
            <p className="text-sm text-emerald-800 dark:text-emerald-300">{passwordSuccess}</p>
          </Card>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <FormInput
            type="password"
            id="currentPassword"
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            autoComplete="current-password"
            required
          />
          <FormInput
            type="password"
            id="newPassword"
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            autoComplete="new-password"
            required
            minLength={8}
            helperText="Must be at least 8 characters"
          />
          <FormInput
            type="password"
            id="confirmPassword"
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            autoComplete="new-password"
            required
            minLength={8}
          />
          <Button
            type="submit"
            disabled={changingPassword}
          >
            {changingPassword ? "Changing Password..." : "Change Password"}
          </Button>
        </form>
      </Card>

      {/* Subscription Management */}
      {subscriptionData ? (
        <Card className="mt-10 md:mt-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <SectionHeader title="Subscription" description="Manage your subscription plan" />
            </div>
            <div className={`rounded-full px-4 py-2 text-sm font-semibold ${
              subscriptionData.is_active
                ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
            }`}>
              {subscriptionData.is_active ? "Active" : subscriptionData.status}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Plan</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-slate-50">{planName}</p>
              <p className="mt-1 text-gray-700 dark:text-slate-300">{planPrice}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Status</p>
              <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-slate-50 capitalize">{subscriptionData.status}</p>
              {subscriptionData.is_active && subscriptionData.days_remaining !== null && (
                <p className="mt-1 text-gray-700 dark:text-slate-300">
                  {subscriptionData.days_remaining} {subscriptionData.days_remaining === 1 ? "day" : "days"} remaining
                </p>
              )}
            </div>
            {subscriptionData.expires_at && (
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Expires</p>
                <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-slate-50">
                  {new Date(subscriptionData.expires_at).toLocaleDateString()}
                </p>
              </div>
            )}
            {subscriptionData.started_at && (
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Started</p>
                <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-slate-50">
                  {new Date(subscriptionData.started_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {canChange && (
            <div className="mt-8 border-t border-gray-200 dark:border-slate-700 pt-6">
              <SectionHeader title="Change Plan" className="mb-4" />
              <p className="mb-4 text-sm text-gray-700 dark:text-slate-300">
                Switch to a different plan. Your current plan will remain active until the end of the billing period.
              </p>
              <div className="flex flex-wrap gap-4">
                {subscriptionData.type !== "starter" && (
                  <Button
                    onClick={() => handleChangePlan("starter")}
                    disabled={changing}
                    variant="secondary"
                  >
                    {changing ? "Processing..." : "Switch to Starter ($7/month)"}
                  </Button>
                )}
                {subscriptionData.type !== "pro" && subscriptionData.type !== "monthly" && (
                  <Button
                    onClick={() => handleChangePlan("pro")}
                    disabled={changing}
                    variant="secondary"
                  >
                    {changing ? "Processing..." : "Switch to Pro ($15/month)"}
                  </Button>
                )}
                {subscriptionData.type !== "weekly" && (
                  <Button
                    onClick={() => handleChangePlan("weekly")}
                    disabled={changing}
                    variant="secondary"
                  >
                    {changing ? "Processing..." : "Switch to Weekly ($5/week)"}
                  </Button>
                )}
                {/* Legacy monthly plan - allow switching to pro */}
                {subscriptionData.type === "monthly" && (
                  <Button
                    onClick={() => handleChangePlan("pro")}
                    disabled={changing}
                    variant="secondary"
                  >
                    {changing ? "Processing..." : "Switch to Pro ($15/month)"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {canCancel && (
            <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-6">
              <SectionHeader title="Cancel Subscription" className="mb-4" />
              <p className="mb-4 text-sm text-gray-700 dark:text-slate-300">
                You'll continue to have access to all features until your subscription expires on{" "}
                {subscriptionData.expires_at ? new Date(subscriptionData.expires_at).toLocaleDateString() : "the expiration date"}.
              </p>
              <Button
                onClick={handleCancelClick}
                disabled={cancelling}
                variant="secondary"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Cancel Subscription
              </Button>
            </div>
          )}

          {!subscriptionData.is_active && (
            <div className="mt-6">
              <Button as={Link} to="/pricing">
                Resubscribe
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card className="mb-8 text-center">
          <p className="text-gray-700 dark:text-slate-300">No active subscription found.</p>
          <Button as={Link} to="/pricing" className="mt-4">
            View Pricing Plans
          </Button>
        </Card>
      )}

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <Card className="mt-10 md:mt-12">
          <SectionHeader title="Payment History" className="mb-6 text-2xl" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">Plan</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 dark:border-slate-700">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300">
                      {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-slate-50">
                      {payment.amount != null && typeof payment.amount === 'number' 
                        ? `$${payment.amount.toFixed(2)}` 
                        : payment.amount != null 
                          ? `$${Number(payment.amount).toFixed(2)}` 
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300 capitalize">{payment.subscription_type}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <SectionHeader title="Cancel Subscription" className="mb-4 text-2xl" />
            <p className="mb-6 text-sm text-gray-700 dark:text-slate-300">
              We're sorry to see you go. Your subscription will remain active until{" "}
              {subscriptionData?.expires_at ? new Date(subscriptionData.expires_at).toLocaleDateString() : "the expiration date"}.
              Please let us know why you're canceling so we can improve.
            </p>
            
            <div className="mb-6">
              <label htmlFor="cancellation-reason" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                Reason for Cancellation <span className="text-red-500">*</span>
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
              <label htmlFor="additional-comments" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                Additional Comments {selectedReason === "other" && <span className="text-red-500">*</span>}
                {selectedReason && selectedReason !== "other" && <span className="text-gray-500 dark:text-slate-500 text-xs font-normal">(Optional)</span>}
              </label>
              <textarea
                id="additional-comments"
                value={additionalComments}
                onChange={handleCommentsChange}
                placeholder={selectedReason === "other" ? "Please provide details..." : "Any additional feedback (optional)"}
                rows={4}
                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-gray-900 dark:text-slate-200 focus:border-indigo-400 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
                required={selectedReason === "other"}
                maxLength={500}
              />
              <p className="mt-2 text-xs text-gray-600 dark:text-slate-400">
                {additionalComments.length}/500 characters
              </p>
            </div>

            {error && (
              <Card className="mb-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </Card>
            )}

            <div className="flex gap-3">
              <Button
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
              </Button>
              <Button
                onClick={handleCancelConfirm}
                disabled={cancelling || !selectedReason || (selectedReason === "other" && !additionalComments.trim())}
                variant="secondary"
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}

