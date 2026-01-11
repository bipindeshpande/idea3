import { useLocation } from "react-router-dom";

/**
 * Hook to get URL query parameters
 * @returns {URLSearchParams} Query parameters
 */
export function useQuery() {
  return new URLSearchParams(useLocation().search);
}
