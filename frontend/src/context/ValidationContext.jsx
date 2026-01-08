import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import apiClient, { ApiError } from "../utils/apiClient.js";

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
 const validationId = validation.id || validation.validation_id;
 
 // Check if validation with same ID already exists
 const existingIndex = validations.findIndex(v => {
  const vId = v.id || v.validation_id;
  return vId && validationId && vId === validationId;
 });
 
 if (existingIndex >= 0) {
  // Replace existing validation (keep its position or move to front)
  validations[existingIndex] = validation;
 } else {
  // Add new validation to front
  validations.unshift(validation);
 }
 
 // Keep only the 20 most recent
 localStorage.setItem(STORAGE_KEY, JSON.stringify(validations.slice(0, 20)));
}

export function ValidationProvider({ children }) {
 const [currentValidation, setCurrentValidation] = useState(null);
 const [categoryAnswers, setCategoryAnswersState] = useState({});
 const [ideaExplanation, setIdeaExplanationState] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const { isAuthenticated } = useAuth();

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

 let data;
 // Validation requests need longer timeout (90s) due to LLM calls for analysis + next_steps
 const validationTimeout = 90000; // 90 seconds
 if (isEdit) {
 data = await apiClient.put(`/validate-idea/${validationId}`, requestBody, { timeout: validationTimeout });
 } else {
 data = await apiClient.post("/validate-idea", requestBody, { timeout: validationTimeout });
 }
 
 // Backend now returns standardized format: { success: true, validation_id: "...", validation: {...} }
 // Always use 'validation' key (standardized)
 const validationData = data.validation || null;
 
 // 🔍 DEBUG STEP 2: Check what backend sent
 console.log("🔍 Step 2 - Backend response details:", {
  hasDetails: !!validationData?.details,
  detailsType: typeof validationData?.details,
  detailsKeysCount: validationData?.details ? Object.keys(validationData.details).length : 0,
  detailsKeys: validationData?.details ? Object.keys(validationData.details).slice(0, 3) : "none"
 });
 
 // Only save if we have valid validation data
 if (!validationData || typeof validationData !== 'object') {
 console.error("Invalid validation response - no validation data:", data);
 throw new Error("No validation data received from server");
 }

 // Ensure validation data has required fields (scores and overall_score)
 if (!validationData.scores || validationData.overall_score === undefined) {
 console.error("Validation data missing required fields:", {
  hasScores: !!validationData.scores,
  overallScore: validationData.overall_score,
  validationDataKeys: Object.keys(validationData),
  fullResponse: data
 });
 throw new Error("Validation data incomplete: missing scores or overall_score");
 }

 const validation = {
 id: data.validation_id || validationId || Date.now().toString(),
 timestamp: Date.now(),
 categoryAnswers: answers,
 ideaExplanation: explanation,
 validation: validationData, // Store the complete validation result (standardized)
 };

 // Only save successful validations with valid data
 saveValidation(validation);
 setCurrentValidation(validation);
 return { success: true, validation };
 } catch (err) {
 const errorMessage = err instanceof ApiError ? err.message : (err.message || "Unexpected error");
 setError(errorMessage);
 return { success: false, error: errorMessage };
 } finally {
 setLoading(false);
 }
 }, []);

 const loadValidationById = useCallback(async (validationId) => {
 // Strip "val_" prefix if present
 const cleanId = validationId.toString().replace(/^val_/, '');
 
 // Try to load directly from GET /api/validate-idea/{id} first
 try {
 const data = await apiClient.get(`/validate-idea/${cleanId}`);
 // GET endpoint now returns standardized format with 'validation' key
 const validationResult = data.validation || null;
 
 if (!validationResult || typeof validationResult !== 'object') {
  console.error("No validation data in GET response:", data);
  throw new Error("No validation data in response");
 }
 
 // Ensure validation result has required fields
 if (!validationResult.scores || validationResult.overall_score === undefined) {
  console.warn("Validation result missing scores or overall_score:", validationResult);
 }

 const validationData = {
 id: data.validation_id || data.id || cleanId,
 validation_id: data.validation_id || data.id,
 timestamp: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
 categoryAnswers: data.category_answers || {},
 ideaExplanation: data.idea_explanation || "",
 validation: validationResult, // Standardized format
 };

 setCurrentValidation(validationData);
 setCategoryAnswers(data.category_answers || {});
 setIdeaExplanation(data.idea_explanation || "");
 return validationData;
 } catch (error) {
 // If 404 and user is authenticated, try user/activity as fallback
 if (error instanceof ApiError && error.status === 404 && isAuthenticated) {
 try {
 const activityData = await apiClient.get('/user/activity');
 const validations = activityData.activity?.validations || activityData.validations || [];

 const validation = validations.find(v => {
 const vid = v.validation_id || v.id;
 const vidStr = String(vid).replace(/^val_/, '');
 return vidStr === cleanId || String(vid) === cleanId;
 });

 if (validation) {
 // Standardized format - always use 'validation' key
 const validationResult = validation.validation || validation.validation_result || {};
 const validationData = {
 id: validation.validation_id || validation.id,
 validation_id: validation.validation_id,
 timestamp: validation.created_at ? new Date(validation.created_at).getTime() : Date.now(),
 categoryAnswers: validation.category_answers || {},
 ideaExplanation: validation.idea_explanation || "",
 validation: validationResult, // Standardized format
 };

 setCurrentValidation(validationData);
 setCategoryAnswers(validation.category_answers || {});
 setIdeaExplanation(validation.idea_explanation || "");
 return validationData;
 }
 } catch (fallbackError) {
 console.error("Failed to load validation from activity fallback:", fallbackError);
 }
 } else {
 console.error("Failed to load validation from API:", error);
 }
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
 }, [isAuthenticated]);

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

