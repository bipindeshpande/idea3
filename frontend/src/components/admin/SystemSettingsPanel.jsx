import { useState, useEffect } from "react";
import { getAdminAuthToken, ADMIN_STORAGE_KEY } from "../../utils/admin.js";

export default function SystemSettingsPanel() {
  const [debugMode, setDebugMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const authToken = getAdminAuthToken();
      const response = await fetch("/api/admin/settings", {
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setDebugMode(data.settings.debug_mode || false);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to load settings:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDebug = async () => {
    setSaving(true);
    setMessage("");
    try {
      const authToken = getAdminAuthToken();
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          debug_mode: !debugMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDebugMode(!debugMode);
          setMessage(`Debug mode ${!debugMode ? "enabled" : "disabled"}. Server restart required for changes to take effect.`);
          setTimeout(() => setMessage(""), 5000);
        }
      } else {
        setMessage("Failed to update settings");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update settings:", error);
      }
      setMessage("Failed to update settings");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h3 className="mb-4 text-lg font-semibold text-primary">System Settings</h3>
        <p className="text-sm text-secondary">Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-primary">System Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-default bg-surface p-4">
          <div>
            <h4 className="font-semibold text-primary">Debug Mode</h4>
            <p className="mt-1 text-xs text-secondary">
              Enable Flask debug mode. Shows detailed error tracebacks. <strong>Warning:</strong> Disable in production for security.
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={debugMode}
              onChange={handleToggleDebug}
              disabled={saving}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-surface-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-default after:bg-surface after:transition-all after:content-[''] peer-checked:bg-surface-muted peer-checked:after:translate-x-full peer-checked:after:border-default"></div>
          </label>
        </div>
        {message && (
          <div className={`rounded-lg border p-3 text-sm ${
            message.includes("enabled") || message.includes("disabled")
              ? "border-default bg-surface text-accent"
              : "badge-danger"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

