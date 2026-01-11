/**
 * Action Items Section Component
 * Renders action items list without collapsible wrapper (used in dedicated Actions & Notes tab)
 */
export default function ActionItemsSection({
  actions,
  loadingActions,
  newActionText,
  setNewActionText,
  handleCreateAction,
  handleUpdateAction,
  isValidIdeaId,
  isAuthenticated,
}) {
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-4">
        {/* Add new action */}
        {!isValidIdeaId ? (
          <div className="rounded-lg border border-default bg-surface p-3">
            <p className="text-sm text-accent">Idea reference not ready</p>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={newActionText}
              onChange={(e) => setNewActionText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreateAction()}
              placeholder="Add a new action item..."
              className="ui-input flex-1 focus-visible:outline-accent"
            />
            <button
              onClick={handleCreateAction}
              disabled={!newActionText.trim() || !isValidIdeaId}
              className="ui-btn ui-btn-primary focus-visible:outline-accent disabled:opacity-50"
            >
              Add
            </button>
          </div>
        )}

        {/* Actions list */}
        {loadingActions ? (
          <p className="text-sm text-secondary">Loading actions...</p>
        ) : actions.length === 0 ? (
          <div>
            <p className="text-sm text-secondary">
              No action items yet. Add one above to get started!
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-secondary mt-1">
                Debug: actions.length = {actions.length}, loadingActions = {String(loadingActions)}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-secondary mb-2">
                Debug: Rendering {actions.length} actions
              </p>
            )}
            {actions.map((action) => (
              <div
                key={action.id}
                className="flex items-center gap-3 rounded-xl border border-default bg-surface p-3 overflow-hidden min-w-0"
              >
                <select
                  value={action.status}
                  onChange={(e) => handleUpdateAction(action.id, e.target.value)}
                  className="rounded-lg border border-default bg-surface px-2 py-1 text-xs font-semibold text-primary focus:border-default focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
                <span
                  className={`flex-1 text-sm break-words ${
                    action.status === "completed" ? "line-through text-secondary" : "text-primary"
                  }`}
                >
                  {action.action_text}
                </span>
                {action.due_date && (() => {
                  try {
                    const dueDate = new Date(action.due_date);
                    if (!isNaN(dueDate.getTime())) {
                      return (
                        <span className="text-xs text-secondary">
                          Due: {dueDate.toLocaleDateString()}
                        </span>
                      );
                    }
                  } catch (e) {
                    // Invalid date, don't show
                  }
                })()}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

