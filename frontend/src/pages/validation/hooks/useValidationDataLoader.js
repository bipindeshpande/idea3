import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useValidation } from "../../../context/ValidationContext.jsx";

/**
 * Custom hook to handle loading validation data from URL parameters
 */
export function useValidationDataLoader() {
  const [searchParams] = useSearchParams();
  const { currentValidation, loadValidationById } = useValidation();
  const lastLoadedValidationId = useRef(null);
  const [previousScore, setPreviousScore] = useState(null);
  const [previousValidationId, setPreviousValidationId] = useState(null);

  useEffect(() => {
    const validationId = searchParams.get("id");
    const prevId = searchParams.get("previous");
    const prevScore = searchParams.get("previousScore");

    if (validationId) {
      // Normalize IDs for comparison (strip "val_" prefix)
      const normalizeId = (id) => {
        if (!id) return "";
        return String(id).replace(/^val_/, '');
      };

      const normalizedUrlId = normalizeId(validationId);
      const currentId = currentValidation?.id || currentValidation?.validation_id;
      const normalizedCurrentId = normalizeId(currentId);
      const lastLoadedId = normalizeId(lastLoadedValidationId.current);

      // Check if we need to load a different validation
      // Load if:
      // - no current validation OR
      // - current validation ID doesn't match URL ID OR
      // - we haven't loaded this ID yet (to handle cases where comparison might fail)
      // - current validation exists but doesn't have validation data (scores, recommendations, etc.)
      const needsLoad = !currentValidation ||
        normalizedCurrentId !== normalizedUrlId ||
        lastLoadedId !== normalizedUrlId ||
        (currentValidation && !currentValidation.validation);

      if (needsLoad) {
        lastLoadedValidationId.current = validationId;
        loadValidationById(validationId).catch(err => {
          console.error("Failed to load validation:", err);
        });
      }
    }

    // Set previous validation data for comparison
    if (prevId && prevScore) {
      setPreviousValidationId(prevId);
      setPreviousScore(parseFloat(prevScore));
    }
  }, [searchParams, currentValidation, loadValidationById]);

  return {
    previousValidationId,
    previousScore,
  };
}

