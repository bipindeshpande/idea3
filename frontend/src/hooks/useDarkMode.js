import { useState, useEffect } from "react";

/**
 * Hook to detect and track dark mode state
 * Watches for changes to the document's data-theme attribute
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    };
    
    // Initial check
    checkDarkMode();
    
    // Watch for changes using MutationObserver
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    
    return () => observer.disconnect();
  }, []);
  
  return isDark;
}
