import { useState, useCallback } from "react";

/**
 * Custom hook for managing validation form state and handlers
 * 
 * @param {Function} setCategoryAnswers - Function to set category answers in context
 * @param {Function} setIdeaExplanation - Function to set idea explanation in context
 * @param {Function} validateIdea - Function to submit validation
 * @param {Function} navigate - Navigation function
 * @param {string|null} editValidationId - Validation ID if editing
 * @param {boolean} isRevalidate - Whether this is a revalidation
 * @returns {Object} Form state and handlers
 */
export function useValidationForm({
  setCategoryAnswers,
  setIdeaExplanation,
  validateIdea,
  navigate,
  editValidationId,
  isRevalidate,
}) {
  // Screen 1 state (About Your Idea - 4 dropdowns)
  const [screen1Answers, setScreen1Answers] = useState({});

  // Screen 2 state (How Your Idea Works - 5 dropdowns)
  const [screen2Answers, setScreen2Answers] = useState({});

  // Screen 3 state (Tell Us More)
  const [structuredDescription, setStructuredDescription] = useState("");
  const [optionalAnswers, setOptionalAnswers] = useState({
    initial_budget: "",
    delivery_channel: "",
    constraints: [],
    competitors: "",
  });

  const handleScreen1Answer = useCallback((questionId, answer) => {
    setScreen1Answers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  const handleScreen2Answer = useCallback((questionId, answer) => {
    setScreen2Answers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  const handleOptionalAnswer = useCallback((fieldId, value) => {
    setOptionalAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  }, []);

  const handleConstraintToggle = useCallback((constraint) => {
    setOptionalAnswers((prev) => ({
      ...prev,
      constraints: prev.constraints.includes(constraint)
        ? prev.constraints.filter((c) => c !== constraint)
        : [...prev.constraints, constraint],
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    // Merge all answers into category_answers for backend
    const mergedCategoryAnswers = {
      ...screen1Answers,
      ...screen2Answers,
      initial_budget: optionalAnswers.initial_budget,
      delivery_channel: optionalAnswers.delivery_channel,
      constraints: optionalAnswers.constraints,
      competitors: optionalAnswers.competitors,
    };

    setCategoryAnswers(mergedCategoryAnswers);
    setIdeaExplanation(structuredDescription);

    // Use edit mode if validation ID is present
    const result = await validateIdea(mergedCategoryAnswers, structuredDescription, editValidationId || undefined);

    if (result.success) {
      if (isRevalidate) {
        // Note: previousValidationData would need to be passed in if needed
        navigate(`/validate-result?id=${result.validation.id}`);
        localStorage.removeItem("revalidate_data");
      } else {
        navigate(`/validate-result?id=${result.validation.id}`);
      }
    }
  }, [
    screen1Answers,
    screen2Answers,
    optionalAnswers,
    structuredDescription,
    setCategoryAnswers,
    setIdeaExplanation,
    validateIdea,
    navigate,
    editValidationId,
    isRevalidate,
  ]);

  return {
    screen1Answers,
    screen2Answers,
    structuredDescription,
    optionalAnswers,
    setScreen1Answers,
    setScreen2Answers,
    setStructuredDescription,
    setOptionalAnswers,
    handleScreen1Answer,
    handleScreen2Answer,
    handleOptionalAnswer,
    handleConstraintToggle,
    handleSubmit,
  };
}

