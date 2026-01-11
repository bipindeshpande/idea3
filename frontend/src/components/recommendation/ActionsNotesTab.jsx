import ActionItemsSection from "./ActionItemsSection.jsx";
import NotesSection from "./NotesSection.jsx";

/**
 * ActionsNotesTab - Dedicated tab for managing action items and notes
 * Consolidated in one place for easier access and management
 */
export default function ActionsNotesTab({
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
  handleCreateNote,
  isValidIdeaId,
  isAuthenticated
}) {
  return (
    <div className="space-y-6 mt-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">📋 Actions & Notes</h2>
        <p className="text-secondary text-sm max-w-2xl mx-auto">
          Track your action items and capture notes about this recommendation. 
          All changes are automatically saved.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Items Section */}
        <div className="bg-surface rounded-xl p-6 border border-divider shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✅</span>
            <h3 className="text-xl font-semibold text-primary">Action Items</h3>
          </div>
          <p className="text-sm text-secondary mb-4">
            Create and track action items for this idea. Check them off as you complete them.
          </p>
          <ActionItemsSection
            actions={actions}
            loadingActions={loadingActions}
            newActionText={newActionText}
            setNewActionText={setNewActionText}
            handleCreateAction={handleCreateAction}
            handleUpdateAction={handleUpdateAction}
            isValidIdeaId={isValidIdeaId}
            isAuthenticated={isAuthenticated}
          />
        </div>

        {/* Notes Section */}
        <div className="bg-surface rounded-xl p-6 border border-divider shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📝</span>
            <h3 className="text-xl font-semibold text-primary">Notes</h3>
          </div>
          <p className="text-sm text-secondary mb-4">
            Capture your thoughts, research findings, or questions about this recommendation.
          </p>
          <NotesSection
            notes={notes}
            loadingNotes={loadingNotes}
            newNoteContent={newNoteContent}
            setNewNoteContent={setNewNoteContent}
            handleCreateNote={handleCreateNote}
            isValidIdeaId={isValidIdeaId}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      {/* Helper Tips */}
      <div className="bg-accent/5 rounded-lg p-4 border border-accent/20 mt-6">
        <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>Pro Tips</span>
        </h4>
        <ul className="text-xs text-secondary space-y-1">
          <li>• Use action items to break down next steps into manageable tasks</li>
          <li>• Add notes about customer conversations, research findings, or questions</li>
          <li>• All changes are saved automatically - no need to click save</li>
          <li>• Access your actions and notes anytime from the dashboard</li>
        </ul>
      </div>
    </div>
  );
}

