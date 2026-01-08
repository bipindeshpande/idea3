import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import UICard from "../../components/ui/ui-card.jsx";

export default function AccountHelp() {
  return (
    <>
      <Seo
        title="How to Use Account | Standard Operating Procedure"
        description="Step-by-step guide to managing your account settings"
        path="/help/account"
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <UICard className="p-6 space-y-6">
          {/* Overview */}
          <div>
            <UIHeading level="h3" className="text-lg font-semibold mb-3">
              Account Overview
            </UIHeading>
            <p className="text-sm text-secondary">
              Your account page is where you manage your profile, subscription, password, and preferences. 
              All your account settings are centralized here for easy access.
            </p>
          </div>

          {/* Step 1 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 1</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                View Account Information
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Review your email address and account status</li>
                <li>Check your current subscription plan</li>
                <li>View account creation date</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Display of your account details and subscription information</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 2</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Manage Subscription
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>View current subscription plan and billing details</li>
                <li>Change subscription plan (upgrade or downgrade)</li>
                <li>Cancel subscription if needed</li>
                <li>Review payment history</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Updated subscription status and billing information</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 3</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Change Password
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Enter your current password</li>
                <li>Enter your new password (minimum 8 characters)</li>
                <li>Confirm your new password</li>
                <li>Submit to update password</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Password updated successfully</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border-l-4 border-accent pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent font-bold">STEP 4</span>
              <UIHeading level="h3" className="text-lg font-semibold">
                Configure Preferences
              </UIHeading>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-primary"><strong>Actions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-secondary ml-2">
                <li>Toggle framework tracking on or off</li>
                <li>Review your psychology profile data</li>
                <li>Update account preferences as needed</li>
              </ul>
              <p className="text-primary mt-3"><strong>Output:</strong></p>
              <p className="text-secondary">Preferences saved and applied to your account</p>
            </div>
          </div>
        </UICard>

        <div className="flex justify-end">
          <Link
            to="/account"
            className="ui-btn ui-btn-primary focus-visible:outline-accent"
          >
            Go to Account
          </Link>
        </div>
      </div>
    </>
  );
}

