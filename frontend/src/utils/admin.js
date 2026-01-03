// Admin constants and utilities
export const ADMIN_PASSWORD = "admin2024"; // Change this to your desired password
export const ADMIN_STORAGE_KEY = "sia_admin_authenticated";
export const ADMIN_MFA_SECRET = "JBSWY3DPEHPK3PXP"; // Base32 encoded secret for TOTP

/**
 * Get authentication token for admin API calls
 */
export const getAdminAuthToken = () => {
  return localStorage.getItem(ADMIN_STORAGE_KEY) === "true" ? ADMIN_PASSWORD : "";
};

/**
 * Check if admin is authenticated
 */
export const isAdminAuthenticated = () => {
  return localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
};

/**
 * Clear admin authentication
 */
export const clearAdminAuth = () => {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
};

/**
 * Verify admin session by checking with backend
 */
export const verifyAdminSession = async () => {
  try {
    const authToken = getAdminAuthToken();
    const response = await fetch("/api/admin/stats", {
      headers: {
        "Authorization": `Bearer ${authToken}`,
      },
    });

    if (response.ok) {
      return true;
    } else {
      clearAdminAuth();
      return false;
    }
  } catch (error) {
    clearAdminAuth();
    return false;
  }
};

