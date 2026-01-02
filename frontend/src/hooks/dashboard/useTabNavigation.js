import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook to manage dashboard tab state with URL synchronization
 * 
 * @param {string} defaultTab - Default tab to show if no URL param
 * @returns {Array} [activeTab, setActiveTab] - Current tab and setter
 */
export function useTabNavigation(defaultTab = "ideas") {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync tab with URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["ideas", "validations", "history"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  return [activeTab, setActiveTab];
}

