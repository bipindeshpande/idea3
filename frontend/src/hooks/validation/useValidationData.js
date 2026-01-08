import { useEffect, useState } from "react";

/**
 * Custom hook for loading user intake data and activity data
 * 
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @param {Function} getAuthHeaders - Function to get auth headers
 * @param {Object} inputs - Inputs from ReportsContext
 * @returns {Object} { userIntake, loadingIntake, isFirstValidation, activityData }
 */
export function useValidationData({ isAuthenticated, getAuthHeaders, inputs }) {
  const [userIntake, setUserIntake] = useState(null);
  const [loadingIntake, setLoadingIntake] = useState(true);
  const [isFirstValidation, setIsFirstValidation] = useState(false);
  const [activityData, setActivityData] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated) {
        setIsFirstValidation(true);
        setLoadingIntake(false);
        return;
      }

      // Check if we already have inputs from context
      if (inputs && Object.keys(inputs).length > 0) {
        const hasValidData = inputs.goal_type || inputs.time_commitment || inputs.budget_range || inputs.interest_area;
        if (hasValidData) {
          setUserIntake(inputs);
          setLoadingIntake(false);
        }
      }

      try {
        // Single API call to get all needed data (reused by edit mode)
        const response = await fetch("/api/user/activity", {
          headers: getAuthHeaders(),
        });

        // Check if response exists before accessing properties
        if (!response) {
          throw new Error('Network error: No response received');
        }

        if (response.ok) {
          const data = await response.json();

          // Store activity data for reuse (including by edit mode)
          setActivityData(data.activity);

          // Check if first validation
          const validationCount = data.activity?.validations?.length || 0;
          setIsFirstValidation(validationCount === 0);

          // Load user intake from latest run (if not already set from context)
          setUserIntake((prevUserIntake) => {
            if (prevUserIntake) return prevUserIntake; // Don't overwrite if already set
            if (data.success && data.activity && data.activity.runs && data.activity.runs.length > 0) {
              const latestRun = data.activity.runs[0];
              if (latestRun.inputs && Object.keys(latestRun.inputs).length > 0) {
                return latestRun.inputs;
              }
            }
            return prevUserIntake;
          });
        }
      } catch (err) {
        console.error("❌ Failed to load user data:", err);
        setIsFirstValidation(true);
      } finally {
        setLoadingIntake(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, getAuthHeaders, inputs]);

  return { userIntake, loadingIntake, isFirstValidation, activityData, setActivityData };
}

