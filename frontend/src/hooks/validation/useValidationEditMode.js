import { useEffect, useState } from "react";

/**
 * Custom hook for loading validation data when in edit mode
 * 
 * @param {string|null} editValidationId - The validation ID to edit (without val_ prefix)
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @param {Function} getAuthHeaders - Function to get auth headers
 * @param {Function} setCategoryAnswers - Function to set category answers in context
 * @param {Function} setIdeaExplanation - Function to set idea explanation in context
 * @param {Function} setError - Function to set error state
 * @param {Object|null} activityData - Cached activity data from useValidationData
 * @param {Function} setActivityData - Function to update activity data
 * @param {Function} setScreen1Answers - Function to set screen 1 answers
 * @param {Function} setScreen2Answers - Function to set screen 2 answers
 * @param {Function} setStructuredDescription - Function to set structured description
 * @param {Function} setOptionalAnswers - Function to set optional answers
 * @returns {Object} { loadingValidationData }
 */
export function useValidationEditMode({
  editValidationId,
  isAuthenticated,
  getAuthHeaders,
  setCategoryAnswers,
  setIdeaExplanation,
  setError,
  activityData,
  setActivityData,
  setScreen1Answers,
  setScreen2Answers,
  setStructuredDescription,
  setOptionalAnswers,
}) {
  const [loadingValidationData, setLoadingValidationData] = useState(false);

  useEffect(() => {
    const loadValidationForEdit = async () => {
      if (!editValidationId) {
        return;
      }

      if (!isAuthenticated) {
        console.warn("🔒 [Edit Mode] User not authenticated, cannot load validation");
        setError("You must be logged in to edit validations. Please log in and try again.");
        return;
      }

      setLoadingValidationData(true);
      setError(null); // Clear any previous errors

      try {
        const searchId = String(editValidationId).trim();
        let validationToEdit = null;

        // Strategy 1: Try from activity data (but without status filter when include_all_statuses=true)
        // First check cache
        if (!validationToEdit && activityData?.validations) {
          validationToEdit = activityData.validations.find((v) => {
            const vid = v.validation_id ? String(v.validation_id).trim() : null;
            const dbId = v.id ? String(v.id).trim() : null;
            return (
              (vid && vid === searchId) ||
              (dbId && dbId.replace(/^val_/, "") === searchId) ||
              (vid && Number(vid) === Number(searchId)) ||
              (dbId && Number(dbId.replace(/^val_/, "")) === Number(searchId))
            );
          });
        }

        // Strategy 3: Fetch from activity endpoint with larger page size and include all statuses
        // This is important for newly created validations that might not be COMPLETED yet
        if (!validationToEdit) {
          const response = await fetch(`/api/user/activity?per_page=100&include_all_statuses=true`, {
            headers: getAuthHeaders(),
          });

          if (response.ok) {
            const data = await response.json();
            const validations = data.activity?.validations || [];
            setActivityData(data.activity);

            validationToEdit = validations.find((v) => {
              const vid = v.validation_id ? String(v.validation_id).trim() : null;
              const dbId = v.id ? String(v.id).trim() : null;

              if (vid && vid === searchId) return true;
              if (dbId && dbId.replace(/^val_/, "") === searchId) return true;

              try {
                const searchNum = Number(searchId);
                if (!isNaN(searchNum)) {
                  if (vid && Number(vid) === searchNum) return true;
                  if (dbId && Number(dbId.replace(/^val_/, "")) === searchNum) return true;
                }
              } catch (e) {
                // Ignore conversion errors
              }

              return false;
            });
          }
        }

        if (!validationToEdit) {
          console.warn("Validation not found for edit");
        }

        if (validationToEdit) {
          // Parse category_answers if it's a string
          let categoryAnswersData = {};
          if (validationToEdit.category_answers) {
            if (typeof validationToEdit.category_answers === "string") {
              try {
                categoryAnswersData = JSON.parse(validationToEdit.category_answers);
              } catch (e) {
                console.error("Failed to parse category_answers", e);
              }
            } else {
              categoryAnswersData = validationToEdit.category_answers;
            }
          }

          // Pre-fill Screen 1 answers (About Your Idea - 4 dropdowns)
          // Direct mapping - use exact field names from form
          const screen1Data = {};
          const screen1Fields = ["industry", "geography", "stage", "commitment"];

          screen1Fields.forEach((field) => {
            // Try direct match first
            if (categoryAnswersData[field]) {
              screen1Data[field] = categoryAnswersData[field];
            }
          });

          // Set screen1 answers - set immediately even if only partial data
          // This ensures dropdowns show values as soon as they're loaded
          if (Object.keys(screen1Data).length > 0) {
            setScreen1Answers((prev) => ({ ...prev, ...screen1Data }));
          }

          // Pre-fill Screen 2 answers (How Your Idea Works - 5 dropdowns)
          // Direct mapping with fallbacks for legacy field names
          const screen2Data = {};
          const screen2FieldMap = {
            problem_category: ["problem_category", "problem"],
            solution_type: ["solution_type", "solution"],
            user_type: ["user_type", "target_audience", "user"],
            revenue_model: ["revenue_model", "business_model", "revenue"],
            unique_moat: ["unique_moat", "uniqueness", "unique_value"],
            business_archetype: ["business_archetype", "business_type", "business_nature"],
          };

          Object.keys(screen2FieldMap).forEach((standardField) => {
            const possibleNames = screen2FieldMap[standardField];
            for (const fieldName of possibleNames) {
              if (categoryAnswersData[fieldName]) {
                screen2Data[standardField] = categoryAnswersData[fieldName];
                break; // Use first match
              }
            }
          });

          // Set screen2 answers - set immediately even if only partial data
          if (Object.keys(screen2Data).length > 0) {
            setScreen2Answers((prev) => ({ ...prev, ...screen2Data }));
          }

          // Pre-fill Screen 3 (Tell Us More)
          if (validationToEdit.idea_explanation) {
            setStructuredDescription(validationToEdit.idea_explanation);
          }

          // Pre-fill optional fields with all possible field name variations
          setOptionalAnswers({
            initial_budget: categoryAnswersData.initial_budget || categoryAnswersData.budget || categoryAnswersData.budget_range || "",
            delivery_channel: categoryAnswersData.delivery_channel || "",
            constraints: Array.isArray(categoryAnswersData.constraints)
              ? categoryAnswersData.constraints
              : categoryAnswersData.constraints
                ? [categoryAnswersData.constraints]
                : [],
            competitors: categoryAnswersData.competitors || categoryAnswersData.competition || "",
          });

          // Set category answers in context
          setCategoryAnswers(categoryAnswersData);
          setIdeaExplanation(validationToEdit.idea_explanation || "");
        } else {
          console.error("Validation not found for ID:", editValidationId);

          // Show the original ID from URL in error message for user clarity
          const originalId = editValidationId || "";
          setError(
            `Validation not found or access denied. The validation with ID "${originalId}" could not be loaded. ` +
              `This validation may have been deleted or doesn't belong to your account.`
          );
        }
      } catch (err) {
        console.error("Exception caught while loading validation:", err);
        setError("Failed to load validation data. Please try again.");
      } finally {
        setLoadingValidationData(false);
      }
    };

    if (editValidationId && isAuthenticated) {
      loadValidationForEdit();
    }
  }, [editValidationId, isAuthenticated, getAuthHeaders, setCategoryAnswers, setIdeaExplanation, activityData, setActivityData, setError, setScreen1Answers, setScreen2Answers, setStructuredDescription, setOptionalAnswers]);

  return {
    loadingValidationData,
  };
}

