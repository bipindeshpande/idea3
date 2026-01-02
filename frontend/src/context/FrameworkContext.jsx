import { createContext, useCallback, useContext, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import apiClient, { ApiError } from "../utils/apiClient.js";

const FrameworkContext = createContext(null);

export function FrameworkProvider({ children }) {
 const [frameworks, setFrameworks] = useState([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const { isAuthenticated, getAuthHeaders } = useAuth();

 const loadFrameworks = useCallback(async (filters = {}) => {
  if (!isAuthenticated) {
   setFrameworks([]);
   return [];
  }

  setLoading(true);
  setError("");

  try {
   const params = new URLSearchParams();
   if (filters.status) params.append("status", filters.status);
   if (filters.framework_template_id) params.append("framework_template_id", filters.framework_template_id);
   if (filters.linked_idea_id) params.append("linked_idea_id", filters.linked_idea_id);
   if (filters.linked_validation_id) params.append("linked_validation_id", filters.linked_validation_id);

   const queryString = params.toString();
   const url = `/frameworks${queryString ? `?${queryString}` : ""}`;
   
   const data = await apiClient.get(url);
   
   if (data.success) {
    setFrameworks(data.frameworks || []);
    return data.frameworks || [];
   }
   
   throw new Error("Failed to load frameworks");
  } catch (err) {
   const errorMessage = err instanceof ApiError ? err.message : (err.message || "Failed to load frameworks");
   setError(errorMessage);
   setFrameworks([]);
   return [];
  } finally {
   setLoading(false);
  }
 }, [isAuthenticated]);

 const loadFrameworkById = useCallback(async (frameworkId) => {
  if (!isAuthenticated) {
   throw new Error("Authentication required");
  }

  setLoading(true);
  setError("");

  try {
   const data = await apiClient.get(`/frameworks/${frameworkId}`);
   
   if (data.success) {
    return data.framework;
   }
   
   throw new Error("Failed to load framework");
  } catch (err) {
   const errorMessage = err instanceof ApiError ? err.message : (err.message || "Failed to load framework");
   setError(errorMessage);
   throw err;
  } finally {
   setLoading(false);
  }
 }, [isAuthenticated]);

 const createFramework = useCallback(async (frameworkData) => {
  if (!isAuthenticated) {
   throw new Error("Authentication required");
  }

  setLoading(true);
  setError("");

  try {
   const data = await apiClient.post("/frameworks", frameworkData);
   
   if (data.success) {
    // Reload frameworks list
    await loadFrameworks();
    return data.framework;
   }
   
   throw new Error("Failed to create framework");
  } catch (err) {
   const errorMessage = err instanceof ApiError ? err.message : (err.message || "Failed to create framework");
   setError(errorMessage);
   throw err;
  } finally {
   setLoading(false);
  }
 }, [isAuthenticated, loadFrameworks]);

 const updateFramework = useCallback(async (frameworkId, updates) => {
  if (!isAuthenticated) {
   throw new Error("Authentication required");
  }

  setLoading(true);
  setError("");

  try {
   const data = await apiClient.put(`/frameworks/${frameworkId}`, updates);
   
   if (data.success) {
    // Update frameworks list
    await loadFrameworks();
    return data.framework;
   }
   
   throw new Error("Failed to update framework");
  } catch (err) {
   const errorMessage = err instanceof ApiError ? err.message : (err.message || "Failed to update framework");
   setError(errorMessage);
   throw err;
  } finally {
   setLoading(false);
  }
 }, [isAuthenticated, loadFrameworks]);

 const deleteFramework = useCallback(async (frameworkId) => {
  if (!isAuthenticated) {
   throw new Error("Authentication required");
  }

  setLoading(true);
  setError("");

  try {
   const data = await apiClient.delete(`/frameworks/${frameworkId}`);
   
   if (data.success) {
    // Reload frameworks list
    await loadFrameworks();
    return true;
   }
   
   throw new Error("Failed to delete framework");
  } catch (err) {
   const errorMessage = err instanceof ApiError ? err.message : (err.message || "Failed to delete framework");
   setError(errorMessage);
   throw err;
  } finally {
   setLoading(false);
  }
 }, [isAuthenticated, loadFrameworks]);

 const exportFramework = useCallback(async (frameworkId) => {
  if (!isAuthenticated) {
   throw new Error("Authentication required");
  }

  setLoading(true);
  setError("");

  try {
   const data = await apiClient.post(`/frameworks/${frameworkId}/export`);
   
   if (data.success) {
    return {
     content: data.content,
     filename: data.filename || "framework.md"
    };
   }
   
   throw new Error("Failed to export framework");
  } catch (err) {
   const errorMessage = err instanceof ApiError ? err.message : (err.message || "Failed to export framework");
   setError(errorMessage);
   throw err;
  } finally {
   setLoading(false);
  }
 }, [isAuthenticated]);

 const populateTemplate = useCallback(async (templateContent, validationId = null, ideaId = null) => {
  if (!isAuthenticated) {
   return templateContent; // Return original if not authenticated
  }

  setLoading(true);
  setError("");

  try {
   const data = await apiClient.post("/frameworks/populate-template", {
    template_content: templateContent,
    validation_id: validationId,
    idea_id: ideaId
   });
   
   if (data.success) {
    return data.content;
   }
   
   return templateContent; // Return original on failure
  } catch (err) {
   console.error("Failed to populate template:", err);
   return templateContent; // Return original on error
  } finally {
   setLoading(false);
  }
 }, [isAuthenticated]);

 const value = {
  frameworks,
  loading,
  error,
  loadFrameworks,
  loadFrameworkById,
  createFramework,
  updateFramework,
  deleteFramework,
  exportFramework,
  populateTemplate,
 };

 return (
  <FrameworkContext.Provider value={value}>
   {children}
  </FrameworkContext.Provider>
 );
}

export function useFramework() {
 const context = useContext(FrameworkContext);
 if (!context) {
  throw new Error("useFramework must be used within FrameworkProvider");
 }
 return context;
}

