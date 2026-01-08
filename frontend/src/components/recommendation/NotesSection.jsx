import CollapsibleSection from "../ui/CollapsibleSection.jsx";
import { getSectionTheme } from "../recommendations/utils/sectionThemes.js";
import { useSectionToggle } from "../recommendations/hooks/useSectionToggle.js";

/**
 * Notes Section Component
 */
export default function NotesSection({
  notes,
  loadingNotes,
  newNoteContent,
  setNewNoteContent,
  handleCreateNote,
  isValidIdeaId,
  isAuthenticated,
}) {
  const { openSections, toggleSection } = useSectionToggle();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <CollapsibleSection
      title="Notes & Journal"
      description="Capture your thoughts, insights, customer feedback, and research findings for this idea."
      theme={getSectionTheme("Notes")}
      isOpen={openSections.has("notes")}
      onToggle={() => toggleSection("notes")}
    >
      <div className="space-y-4">
        {/* Add new note */}
        {!isValidIdeaId ? (
          <div className="rounded-xl border border-default bg-surface p-3">
            <p className="text-sm text-accent">Idea reference not ready</p>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Add a note... (e.g., customer interview insights, pivot ideas, market research)"
              rows={4}
              className="ui-textarea w-full focus-visible:outline-accent"
            />
            <button
              onClick={handleCreateNote}
              disabled={!newNoteContent.trim() || !isValidIdeaId}
              className="ui-btn ui-btn-primary focus-visible:outline-accent disabled:opacity-50"
            >
              Save Note
            </button>
          </div>
        )}

        {/* Notes list */}
        {loadingNotes ? (
          <p className="text-sm text-primary">Loading notes...</p>
        ) : notes.length === 0 ? (
          <div>
            <p className="text-sm text-primary">
              No notes yet. Add one above to start tracking your insights!
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-secondary mt-1">
                Debug: notes.length = {notes.length}, loadingNotes = {String(loadingNotes)}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-secondary mb-2">
                Debug: Rendering {notes.length} notes
              </p>
            )}
            {notes.map((note) => (
              <div
                key={note.id}
                className="ui-card2 ui-pad-md rounded-xl shadow-card"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-primary">
                    {note.created_at
                      ? (() => {
                          try {
                            const date = new Date(note.created_at);
                            return isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString();
                          } catch (e) {
                            return "Unknown date";
                          }
                        })()
                      : "Unknown date"}
                  </span>
                  {note.updated_at &&
                    note.created_at &&
                    note.updated_at !== note.created_at && (
                      <span className="text-xs text-primary">(edited)</span>
                    )}
                </div>
                <p className="whitespace-pre-wrap text-sm text-primary">
                  {note.content}
                </p>
                {note.tags && note.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {note.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-2xl bg-surface border border-default px-[10px] py-1 text-primary font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}

