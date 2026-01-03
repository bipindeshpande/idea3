import { useEffect, useState } from "react";

/**
 * Custom hook for loading smart recommendations and tracking ideas with actions/notes
 */
export function useSmartRecommendations(isAuthenticated, getAuthHeaders) {
  const [smartRecommendations, setSmartRecommendations] = useState(null);
  const [ideasWithActions, setIdeasWithActions] = useState(new Set());
  const [ideasWithNotes, setIdeasWithNotes] = useState(new Set());

  useEffect(() => {
    if (isAuthenticated) {
      const loadSmartRecs = async () => {
        try {
          const response = await fetch("/api/user/smart-recommendations", {
            headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setSmartRecommendations(data.insights);
            } else if (response.status === 401) {
              // Auth failed - don't log error, just skip loading
              console.warn("Authentication failed for smart recommendations");
            }
          } else if (response.status === 401) {
            // Auth failed - don't log error, just skip loading
            console.warn("Authentication failed for smart recommendations");
          }
        } catch (error) {
          // Only log non-network errors
          if (error.name !== 'TypeError' || !error.message.includes('fetch')) {
            console.error("Failed to load smart recommendations:", error);
          }
        }
      };

      const loadActionsAndNotes = async () => {
        try {
          // Load all actions
          const actionsResponse = await fetch("/api/user/actions", {
            headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          });
          if (actionsResponse.ok) {
            const actionsData = await actionsResponse.json();
            if (actionsData.success) {
              const ideaIdsWithActions = new Set();
              actionsData.actions?.forEach(action => {
                if (action.idea_id) {
                  ideaIdsWithActions.add(action.idea_id);
                }
              });
              setIdeasWithActions(ideaIdsWithActions);
            }
          } else if (actionsResponse.status === 401) {
            // Auth failed - don't log error, just skip loading
            console.warn("Authentication failed for actions");
          }

          // Load all notes
          const notesResponse = await fetch("/api/user/notes", {
            headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          });
          if (notesResponse.ok) {
            const notesData = await notesResponse.json();
            if (notesData.success) {
              const ideaIdsWithNotes = new Set();
              notesData.notes?.forEach(note => {
                if (note.idea_id) {
                  ideaIdsWithNotes.add(note.idea_id);
                }
              });
              setIdeasWithNotes(ideaIdsWithNotes);
            }
          } else if (notesResponse.status === 401) {
            // Auth failed - don't log error, just skip loading
            console.warn("Authentication failed for notes");
          }
        } catch (error) {
          // Only log non-network errors
          if (error.name !== 'TypeError' || !error.message.includes('fetch')) {
            console.error("Failed to load actions/notes:", error);
          }
        }
      };

      loadSmartRecs();
      loadActionsAndNotes();
    }
  }, [isAuthenticated, getAuthHeaders]);

  return {
    smartRecommendations,
    ideasWithActions,
    ideasWithNotes
  };
}

