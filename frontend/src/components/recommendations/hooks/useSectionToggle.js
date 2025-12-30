import { useState, useCallback } from "react";

/**
 * Hook to manage section open/close state
 */
export function useSectionToggle(initialOpen = new Set()) {
  const [openSections, setOpenSections] = useState(initialOpen);

  const toggleSection = useCallback((sectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const openSection = useCallback((sectionId) => {
    setOpenSections((prev) => new Set([...prev, sectionId]));
  }, []);

  const closeSection = useCallback((sectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.delete(sectionId);
      return next;
    });
  }, []);

  return {
    openSections,
    toggleSection,
    openSection,
    closeSection,
    setOpenSections,
  };
}
