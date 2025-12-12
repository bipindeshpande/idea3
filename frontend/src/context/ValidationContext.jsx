import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const ValidationContext = createContext(null);
const STORAGE_KEY = "sia_validations";

function loadSavedValidations() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load saved validations", error);
    return [];
  }
}

function saveValidation(validation) {
  const validations = loadSavedValidations();
  validations.unshift(validation);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(validations.slice(0, 20)));
}

export function ValidationProvider({ children }) {
  const [currentValidation, setCurrentValidation] = useState(null);
  const [categoryAnswers, setCategoryAnswersState] = useState({});
  const [ideaExplanation, setIdeaExplanationState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { getAuthHeaders, isAuthenticated } = useAuth();

  const setCategoryAnswers = useCallback((valueOrUpdater) => {
    if (typeof valueOrUpdater === "function") {
      setCategoryAnswersState((prev) => valueOrUpdater(prev));
    } else {
      setCategoryAnswersState(valueOrUpdater);
    }
  }, []);

  const setIdeaExplanation = useCallback((valueOrUpdater) => {
    if (typeof valueOrUpdater === "function") {
      setIdeaExplanationState((prev) => valueOrUpdater(prev));
    } else {
      setIdeaExplanationState(valueOrUpdater);
    }
  }, []);

  const validateIdea = useCallback(async (answers, explanation, validationId = null, ideaId = null, ideaMetadata = null) => {
    setLoading(true);
    setError("");
    setCategoryAnswers(answers);
    setIdeaExplanation(explanation);

    try {
      // Use PUT for editing, POST for creating new
      const isEdit = !!validationId;
      const url = isEdit 
        ? `/api/validate-idea/${validationId}`
        : "/api/validate-idea";
      const method = isEdit ? "PUT" : "POST";

      const requestBody = {
        category_answers: answers,
        idea_explanation: explanation,
      };

      // Add optional idea_id and metadata if provided (for recommendation ideas)
      if (ideaId) {
        requestBody.idea_id = ideaId;
      }
      if (ideaMetadata) {
        requestBody.idea_metadata = ideaMetadata;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Failed to ${isEdit ? 'update' : 'validate'} idea`);
      }

      const data = await response.json();
      
      // Only save if we have valid validation data
      if (!data.validation || typeof data.validation !== 'object') {
        throw new Error("No validation data received from server");
      }

      const validation = {
        id: data.validation_id || validationId || Date.now().toString(),
        timestamp: Date.now(),
        categoryAnswers: answers,
        ideaExplanation: explanation,
        validation: data.validation,
      };

      // Only save successful validations with valid data
      saveValidation(validation);
      setCurrentValidation(validation);
      return { success: true, validation };
    } catch (err) {
      setError(err.message || "Unexpected error");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const loadValidationById = useCallback(async (validationId) => {
    // Strip "val_" prefix if present
    const cleanId = validationId.toString().replace(/^val_/, '');
    
    // Try to load directly from GET /api/validate-idea/{id} first
    try {
      const response = await fetch(`/api/validate-idea/${cleanId}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        const validationResult = data.validation_result || data.validation || {};
        
        const validationData = {
          id: data.validation_id || data.id || cleanId,
          validation_id: data.validation_id || data.id,
          timestamp: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
          categoryAnswers: data.category_answers || {},
          ideaExplanation: data.idea_explanation || "",
          validation: validationResult,
        };
        
        setCurrentValidation(validationData);
        setCategoryAnswers(data.category_answers || {});
        setIdeaExplanation(data.idea_explanation || "");
        return validationData;
      } else if (response.status === 404 && isAuthenticated) {
        // If not found and user is authenticated, try user/activity as fallback
        const activityResponse = await fetch('/api/user/activity', {
          headers: getAuthHeaders(),
        });
        
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          const validations = activityData.activity?.validations || activityData.validations || [];
          
          const validation = validations.find(v => {
            const vid = v.validation_id || v.id;
            const vidStr = String(vid).replace(/^val_/, '');
            return vidStr === cleanId || String(vid) === cleanId;
          });
          
          if (validation) {
            const validationResult = validation.validation_result || {};
            const validationData = {
              id: validation.validation_id || validation.id,
              validation_id: validation.validation_id,
              timestamp: validation.created_at ? new Date(validation.created_at).getTime() : Date.now(),
              categoryAnswers: validation.category_answers || {},
              ideaExplanation: validation.idea_explanation || "",
              validation: validationResult,
            };
            
            setCurrentValidation(validationData);
            setCategoryAnswers(validation.category_answers || {});
            setIdeaExplanation(validation.idea_explanation || "");
            return validationData;
          }
        }
      }
    } catch (error) {
      console.error("Failed to load validation from API:", error);
    }
    
    // Fallback to localStorage
    const validations = loadSavedValidations();
    const validation = validations.find((v) => {
      const vId = v.id || v.validation_id;
      const vIdStr = String(vId).replace(/^val_/, '');
      return vIdStr === cleanId || String(vId) === cleanId;
    });
    
    if (validation) {
      setCurrentValidation(validation);
      setCategoryAnswers(validation.categoryAnswers || {});
      setIdeaExplanation(validation.ideaExplanation || "");
      return validation;
    }
    
    return null;
  }, [isAuthenticated, getAuthHeaders]);

  const getSavedValidations = useCallback(() => {
    return loadSavedValidations();
  }, []);

  const deleteValidation = useCallback((validationId) => {
    const validations = loadSavedValidations();
    const filtered = validations.filter((v) => v.id !== validationId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    if (currentValidation?.id === validationId) {
      setCurrentValidation(null);
      setCategoryAnswers({});
      setIdeaExplanation("");
    }
  }, [currentValidation]);

  const clearCurrentValidation = useCallback(() => {
    setCurrentValidation(null);
    setCategoryAnswers({});
    setIdeaExplanation("");
    setError("");
  }, []);

  const validateRecommendationIdea = useCallback(async (idea, inputs, profileAnalysis = null) => {
    /**
     * Validate a recommendation idea from discovery results
     * 
     * @param {Object} idea - Idea object with title, summary, etc.
     * @param {Object} inputs - User intake inputs from discovery run
     * @param {string} profileAnalysis - Optional profile analysis text
     */
    setLoading(true);
    setError("");

    try {
      // Build category_answers from idea and inputs
      const category_answers = {
        business_archetype: idea.business_type || inputs?.business_type || "",
        delivery_channel: idea.delivery_mode || inputs?.delivery_channel || "",
        target_market: idea.target_market || "",
        revenue_model: idea.revenue_model || "",
        // Map from user inputs
        time_commitment: inputs?.time_commitment || "",
        budget_range: inputs?.budget_range || "",
        risk_tolerance: inputs?.risk_tolerance || "",
        skills: inputs?.skills || {},
      };

      // Build idea explanation from idea details
      const idea_explanation = idea.summary || idea.description || idea.title || "";
      
      // Build idea metadata
      const idea_metadata = {
        title: idea.title || "",
        summary: idea.summary || "",
        target_market: idea.target_market || "",
        revenue_model: idea.revenue_model || "",
        delivery_mode: idea.delivery_mode || "",
      };

      // Build idea_id from idea index if available
      const idea_id = idea.index !== undefined ? `idea_${idea.index}` : null;

      // Call validateIdea with idea metadata
      const result = await validateIdea(
        category_answers,
        idea_explanation,
        null, // validationId - creating new
        idea_id,
        idea_metadata
      );

      return result;
    } catch (err) {
      setError(err.message || "Unexpected error");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [validateIdea]);

  const value = useMemo(
    () => ({
      currentValidation,
      categoryAnswers,
      ideaExplanation,
      loading,
      error,
      validateIdea,
      validateRecommendationIdea,
      loadValidationById,
      getSavedValidations,
      deleteValidation,
      clearCurrentValidation,
      setCategoryAnswers,
      setIdeaExplanation,
      setError,
    }),
    [
      currentValidation,
      categoryAnswers,
      ideaExplanation,
      loading,
      error,
      validateIdea,
      validateRecommendationIdea,
      loadValidationById,
      getSavedValidations,
      deleteValidation,
      clearCurrentValidation,
      setCategoryAnswers,
      setIdeaExplanation,
    ]
  );

  return <ValidationContext.Provider value={value}>{children}</ValidationContext.Provider>;
}

export function useValidation() {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error("useValidation must be used within ValidationProvider");
  }
  return context;
}

