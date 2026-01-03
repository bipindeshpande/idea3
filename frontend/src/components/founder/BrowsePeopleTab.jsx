import { useState, useEffect, useCallback } from "react";

export default function BrowsePeopleTab({ 
  people, 
  onUpdate, 
  getAuthHeaders, 
  credits, 
  subscriptionType, 
  addToast, 
  connections, 
  onConnectionsUpdate 
}) {
  const [filters, setFilters] = useState({
    skills: "",
    industries: "",
    commitment_level: "",
    location: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const loadFilteredPeople = useCallback(() => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v)
    );
    onUpdate(activeFilters);
  }, [filters, onUpdate]);

  useEffect(() => {
    loadFilteredPeople();
  }, [loadFilteredPeople]);

  const hasPendingRequest = (recipientProfileId) => {
    const sentRequests = (connections?.sent || []).filter(req => req.status === "pending");
    return sentRequests.some(req => req.recipient_id === recipientProfileId);
  };

  const handleConnect = async (recipientProfileId) => {
    if (credits.remaining === 0 && credits.limit !== 999) {
      addToast("You've reached your connection limit. Please upgrade to send more requests.", "error", 5000);
      return;
    }

    try {
      const res = await fetch("/api/founder/connect", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_profile_id: recipientProfileId,
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

  const getMatchReason = (person) => {
    const reasons = [];
    if (person.primary_skills && person.primary_skills.length > 0) {
      reasons.push(person.primary_skills[0]);
    }
    if (person.industries_of_interest && person.industries_of_interest.length > 0) {
      reasons.push(person.industries_of_interest[0]);
    }
    if (person.commitment_level) {
      reasons.push(person.commitment_level);
    }
    return reasons.length > 0 ? `Match on: ${reasons.join(" · ")}` : null;
  };

  const getConnectButtonText = (person) => {
    if (hasPendingRequest(person.id)) {
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
          <h2 className="text-xl font-bold">Browse Founders</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border rounded-lg hover:bg-surface hover:bg-surface text-sm"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="bg-surface bg-surface p-3 rounded-lg border border-default border-default mb-4">
          <p className="text-sm text-accent text-accent">
            <strong>Privacy:</strong> Profiles are anonymized. Names and contact details are only shared after both sides accept.
          </p>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-surface p-4 rounded-lg border border-default mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Skills Offered</label>
              <input
                type="text"
                value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                className="w-full px-3 py-2 border border-default rounded-lg text-sm"
                placeholder="Filter by skills"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Industries</label>
              <input
                type="text"
                value={filters.industries}
                onChange={(e) => setFilters({ ...filters, industries: e.target.value })}
                className="w-full px-3 py-2 border border-default rounded-lg text-sm"
                placeholder="Filter by industries"
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
                onClick={() => setFilters({ skills: "", industries: "", commitment_level: "", location: "" })}
                className="px-4 py-2 border rounded-lg hover:bg-surface hover:bg-surface text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {people.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-default">
          <p className="text-secondary text-secondary mb-2">No matching founders found yet.</p>
          <p className="text-sm text-secondary text-secondary">Check back later or create your profile to get discovered.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {people.map((person) => {
            const matchReason = getMatchReason(person);
            return (
              <div key={person.id} className="bg-surface rounded-xl shadow-sm border border-default p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">Founder Profile</h3>
                    <p className="text-secondary text-secondary mb-2">{person.looking_for || "Looking for collaborators"}</p>
                    {matchReason && (
                      <p className="text-sm text-accent text-accent mb-2 font-medium">{matchReason}</p>
                    )}
                    {person.primary_skills && person.primary_skills.length > 0 && (
                      <div className="flex gap-2 flex-wrap mb-2">
                        {person.primary_skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-app bg-surface rounded text-sm">{skill}</span>
                        ))}
                      </div>
                    )}
                    {person.commitment_level && (
                      <p className="text-sm text-secondary text-secondary">Commitment: {person.commitment_level}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleConnect(person.id)}
                    className="px-4 py-2 bg-accent text-on-accent rounded-lg hover:bg-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed ml-4 whitespace-nowrap"
                    disabled={(credits.remaining === 0 && credits.limit !== 999) || hasPendingRequest(person.id)}
                  >
                    {getConnectButtonText(person)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

