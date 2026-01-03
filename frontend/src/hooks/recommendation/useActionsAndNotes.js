import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing actions and notes
 */
export function useActionsAndNotes(ideaId, isValidIdeaId, isAuthenticated, getAuthHeaders) {
  const [actions, setActions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newActionText, setNewActionText] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  // Load actions and notes for this idea
  useEffect(() => {
    if (!isAuthenticated || !ideaId) {
      if (!ideaId) {
        setActions([]);
        setNotes([]);
      }
      return;
    }

    console.log("[useActionsAndNotes] Loading actions and notes for ideaId:", ideaId);

    const loadActions = async () => {
      setLoadingActions(true);
      try {
        const url = `/api/user/actions?idea_id=${encodeURIComponent(ideaId)}`;
        const response = await fetch(url, {
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        });

        if (response.ok) {
          const text = await response.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.error("[useActionsAndNotes] Failed to parse JSON:", e, "Text:", text);
            return;
          }

          if (data.success) {
            const actionsArray = Array.isArray(data.actions) ? data.actions : (data.actions ? [data.actions] : []);
            setActions(actionsArray);
          } else {
            console.error("[useActionsAndNotes] Failed to load actions - success=false:", data.error);
            setActions([]);
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          console.error("[useActionsAndNotes] Failed to load actions:", response.status, errorData);
          setActions([]);
        }
      } catch (error) {
        console.error("[useActionsAndNotes] Exception loading actions:", error);
        setActions([]);
      } finally {
        setLoadingActions(false);
      }
    };

    const loadNotes = async () => {
      setLoadingNotes(true);
      try {
        const url = `/api/user/notes?idea_id=${encodeURIComponent(ideaId)}`;
        const response = await fetch(url, {
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        });

        if (response.ok) {
          const text = await response.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.error("[useActionsAndNotes] Failed to parse JSON:", e, "Text:", text);
            return;
          }

          if (data.success) {
            const notesArray = Array.isArray(data.notes) ? data.notes : (data.notes ? [data.notes] : []);
            setNotes(notesArray);
          } else {
            console.error("[useActionsAndNotes] Failed to load notes - success=false:", data.error);
            setNotes([]);
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          console.error("[useActionsAndNotes] Failed to load notes:", response.status, errorData);
          setNotes([]);
        }
      } catch (error) {
        console.error("[useActionsAndNotes] Exception loading notes:", error);
        setNotes([]);
      } finally {
        setLoadingNotes(false);
      }
    };

    loadActions();
    loadNotes();
  }, [ideaId, isAuthenticated, getAuthHeaders]);

  const handleCreateAction = useCallback(async () => {
    if (!newActionText.trim() || !ideaId || !isValidIdeaId) {
      console.warn("[useActionsAndNotes] Cannot create action: missing text or invalid ideaId", {
        hasText: !!newActionText.trim(),
        ideaId,
        isValidIdeaId
      });
      return;
    }

    console.log("[useActionsAndNotes] Creating action for ideaId:", ideaId);

    try {
      const response = await fetch("/api/user/actions", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_id: ideaId,
          action_text: newActionText.trim(),
          status: "pending",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("[useActionsAndNotes] Action created successfully:", data.action?.id);
          setActions((prev) => [data.action, ...prev]);
          setNewActionText("");
        } else {
          console.error("[useActionsAndNotes] Failed to create action:", data.error);
          alert(data.error || "Failed to create action. Please try again.");
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("[useActionsAndNotes] Failed to create action:", response.status, errorData);
        alert(errorData.error || "Failed to create action. Please try again.");
      }
    } catch (error) {
      console.error("[useActionsAndNotes] Exception creating action:", error);
      alert("Network error. Please check your connection and try again.");
    }
  }, [newActionText, ideaId, isValidIdeaId, getAuthHeaders]);

  const handleUpdateAction = useCallback(async (actionId, status) => {
    try {
      const response = await fetch(`/api/user/actions/${actionId}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setActions((prev) => prev.map((a) => (a.id === actionId ? data.action : a)));
        } else {
          console.error("Failed to update action:", data.error);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to update action:", errorData.error);
      }
    } catch (error) {
      console.error("Failed to update action:", error);
    }
  }, [getAuthHeaders]);

  const handleCreateNote = useCallback(async () => {
    if (!newNoteContent.trim() || !ideaId || !isValidIdeaId) {
      console.warn("[useActionsAndNotes] Cannot create note: missing content or invalid ideaId", {
        hasContent: !!newNoteContent.trim(),
        ideaId,
        isValidIdeaId
      });
      return;
    }

    console.log("[useActionsAndNotes] Creating note for ideaId:", ideaId);

    try {
      const response = await fetch("/api/user/notes", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_id: ideaId,
          content: newNoteContent.trim(),
          tags: [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("[useActionsAndNotes] Note created successfully:", data.note?.id);
          setNotes((prev) => [data.note, ...prev]);
          setNewNoteContent("");
        } else {
          console.error("[useActionsAndNotes] Failed to create note:", data.error);
          alert(data.error || "Failed to create note. Please try again.");
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("[useActionsAndNotes] Failed to create note:", response.status, errorData);
        alert(errorData.error || "Failed to create note. Please try again.");
      }
    } catch (error) {
      console.error("[useActionsAndNotes] Exception creating note:", error);
      alert("Network error. Please check your connection and try again.");
    }
  }, [newNoteContent, ideaId, isValidIdeaId, getAuthHeaders]);

  return {
    actions,
    notes,
    loadingActions,
    loadingNotes,
    newActionText,
    setNewActionText,
    newNoteContent,
    setNewNoteContent,
    handleCreateAction,
    handleUpdateAction,
    handleCreateNote
  };
}

