import { useState, useEffect, useCallback } from "react";

export default function BrowseIdeasTab({ 
  ideas, 
  onUpdate, 
  getAuthHeaders, 
  credits, 
  subscriptionType, 
  addToast, 
  connections, 
  onConnectionsUpdate 
}) {
  const [filters, setFilters] = useState({
    industry: "",
    stage: "",
    skills_needed: "",
    commitment_level: "",
    location: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const loadFilteredIdeas = useCallback(() => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v)
    );
    onUpdate(activeFilters);
  }, [filters, onUpdate]);

  useEffect(() => {
    loadFilteredIdeas();
  }, [loadFilteredIdeas]);

  const hasPendingRequest = (ideaId) => {
    const sentRequests = (connections?.sent || []).filter(req => req.status === "pending");
    return sentRequests.some(req => req.idea_listing_id === ideaId);
  };

  const handleConnect = async (idea) => {
    if (credits.remaining === 0 && credits.limit !== 999) {
      addToast("You've reached your connection limit. Please upgrade to send more requests.", "error", 5000);
      return;
    }

    try {
      const res = await fetch("/api/founder/connect", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_listing_id: idea.id,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          addToast("Connection request sent!", "success");
          onConnectionsUpdate(); // Reload connections to update button state
          onUpdate(filters);
        } else {
          addToast(data.error || "Failed to send request", "error");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        addToast(errorData.error || "Failed to send request", "error");
      }
    } catch (err) {
      console.error("Error sending connection:", err);
      addToast("Failed to send connection request", "error");
    }
  };

  const getMatchReason = (idea) => {
    const reasons = [];
    if (idea.industry) reasons.push(idea.industry);
    if (idea.stage) reasons.push(idea.stage);
    if (idea.founder?.commitment_level) reasons.push(idea.founder.commitment_level);
    return reasons.length > 0 ? `Match on: ${reasons.join(" · ")}` : null;
  };

  const getConnectButtonText = (idea) => {
    if (hasPendingRequest(idea.id)) {
      return "Connection Request Sent";
    }
    if (subscriptionType === "pro" || subscriptionType === "annual") {
      return "Connect";
    }
    if (credits.remaining > 0) {
      return `Connect (uses 1 credit · ${credits.remaining} left)`;
    }
    return "Connect (limit reached)";
  };

  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Browse Ideas</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border rounded-lg hover:bg-surface text-sm"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="bg-surface p-3 rounded-lg border border-default mb-4">
          <p className="text-sm text-accent">
            <strong>Privacy:</strong> Profiles are anonymized. Names and contact details are only shared after both sides accept.
          </p>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-surface p-4 rounded-lg border border-default mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Industry</label>
              <input
                type="text"
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                className="w-full px-3 py-2 border border-default rounded-lg text-sm"
                placeholder="Filter by industry"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
                className="w-full px-3 py-2 border border-default rounded-lg text-sm"
              >
                <option value="">All stages</option>
                <option value="idea">Idea</option>
                <option value="mvp">MVP</option>
                <option value="launched">Launched</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Skills Needed</label>
              <input
                type="text"
                value={filters.skills_needed}
                onChange={(e) => setFilters({ ...filters, skills_needed: e.target.value })}
                className="w-full px-3 py-2 border border-default rounded-lg text-sm"
                placeholder="Filter by skills"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Commitment Level</label>
              <select
                value={filters.commitment_level}
                onChange={(e) => setFilters({ ...filters, commitment_level: e.target.value })}
                className="w-full px-3 py-2 border border-default rounded-lg text-sm"
              >
                <option value="">All levels</option>
                <option value="part-time">Part-time</option>
                <option value="full-time">Full-time</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location (Optional)</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-3 py-2 border border-default rounded-lg text-sm"
                placeholder="Filter by location"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ industry: "", stage: "", skills_needed: "", commitment_level: "", location: "" })}
                className="px-4 py-2 border rounded-lg hover:bg-surface text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-default">
          <p className="text-secondary mb-2">No matching ideas found yet.</p>
          <p className="text-sm text-secondary">Check back later or list your own idea to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea) => {
            const matchReason = getMatchReason(idea);
            return (
              <div key={idea.id} className="bg-surface rounded-xl shadow-sm border border-default p-6">
                <h3 className="font-bold text-lg mb-2">{idea.title}</h3>
                <p className="text-secondary mb-4">{idea.brief_description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {idea.industry && <span className="px-2 py-1 bg-surface rounded text-sm">{idea.industry}</span>}
                  {idea.stage && <span className="px-2 py-1 bg-surface rounded text-sm">{idea.stage}</span>}
                  {idea.commitment_level && <span className="px-2 py-1 bg-surface rounded text-sm">{idea.commitment_level}</span>}
                </div>
                {matchReason && (
                  <p className="text-sm text-accent mb-3 font-medium">{matchReason}</p>
                )}
                {idea.founder && (
                  <div className="mb-4 text-sm text-secondary">
                    <p>Looking for: {idea.founder.looking_for || "Collaborators"}</p>
                    {idea.founder.primary_skills && idea.founder.primary_skills.length > 0 && (
                      <p className="mt-1">Skills: {idea.founder.primary_skills.join(", ")}</p>
                    )}
                  </div>
                )}
                <button
                  onClick={() => handleConnect(idea)}
                  className="px-4 py-2 bg-accent text-on-accent rounded-lg hover:bg-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={(credits.remaining === 0 && credits.limit !== 999) || hasPendingRequest(idea.id)}
                >
                  {getConnectButtonText(idea)}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

