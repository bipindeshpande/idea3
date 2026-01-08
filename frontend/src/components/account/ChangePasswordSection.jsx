import Card from "../ui/Card.jsx";
import SectionHeader from "../layout/SectionHeader.jsx";
import FormInput from "../ui/FormInput.jsx";
import UIButton from "../ui/ui-button.jsx";
import { WORKSPACE_TYPOGRAPHY } from "../workspace/WorkspaceTheme.js";

/**
 * Change Password section with form
 */
export default function ChangePasswordSection({
  passwordForm,
  setPasswordForm,
  passwordError,
  passwordSuccess,
  changingPassword,
  onSubmit
}) {
  return (
    <Card className="mt-6">
      <SectionHeader title="Change Password" className="mb-6" />

      {passwordError && (
        <Card className="mb-4 border-default bg-surface">
          <p className={WORKSPACE_TYPOGRAPHY.bodySmall + " text-accent"}>{passwordError}</p>
        </Card>
      )}

      {passwordSuccess && (
        <Card className="mb-4 border-default bg-surface">
          <p className={WORKSPACE_TYPOGRAPHY.bodySmall + " text-accent"}>{passwordSuccess}</p>
        </Card>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
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
        <UIButton
          type="submit"
          disabled={changingPassword}
        >
          {changingPassword ? "Changing Password..." : "Change Password"}
        </UIButton>
      </form>
    </Card>
  );
}

