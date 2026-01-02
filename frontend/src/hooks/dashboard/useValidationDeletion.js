import { useCallback } from "react";

/**
 * Custom hook to handle validation deletion with confirmation
 * 
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @param {Function} getAuthHeaders - Function to get auth headers
 * @param {Function} deleteValidationFromContext - Function to delete validation from context
 * @param {Function} loadDashboardData - Function to reload dashboard data
 * @param {Function} setApiValidations - State setter for API validations
 * @returns {Function} handleDeleteValidation - Function to delete a validation
 */
export function useValidationDeletion({
  isAuthenticated,
  getAuthHeaders,
  deleteValidationFromContext,
  loadDashboardData,
  setApiValidations
}) {
  const handleDeleteValidation = useCallback(async (session) => {
    // Extract validation ID
    const validationId = session.validation_id || session.id;
    if (!validationId) {
      alert("Error: Cannot identify validation to delete.");
      return;
    }

    // Show warning dialog
    const warningMessage = `This will permanently delete this validation. This action cannot be undone.\n\nAre you sure you want to continue?`;
    
    if (!window.confirm(warningMessage)) {
      return; // User cancelled
    }

    try {
      // Try to delete from API if authenticated
      if (isAuthenticated) {
        try {
          // Check if there's an API delete endpoint - if not, we'll handle it gracefully
          const cleanId = String(validationId).replace(/^val_/, '');
          await fetch(`/api/validate-idea/${cleanId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
        } catch (apiError) {
          // If API delete fails (e.g., endpoint doesn't exist), fall back to localStorage
          console.warn("API delete failed, using localStorage:", apiError);
        }
      }

      // Delete from localStorage
      deleteValidationFromContext(validationId);

      // Immediately remove from state
      setApiValidations(prev => prev.filter(v => {
        const vid = v.validation_id || v.id;
        return vid !== validationId && String(vid) !== String(validationId);
      }));

      // Reload dashboard data to refresh the list
      if (isAuthenticated) {
        await loadDashboardData();
      }
    } catch (error) {
      const errorMessage = error?.message || error?.detail || "Unknown error";
      alert(`Failed to delete validation.\n\nError: ${errorMessage}`);
      
      // On error, reload data to restore correct state
      if (isAuthenticated) {
        await loadDashboardData();
      }
    }
  }, [isAuthenticated, getAuthHeaders, deleteValidationFromContext, loadDashboardData, setApiValidations]);

  return handleDeleteValidation;
}

