import { useState } from "react";

export default function ListingsTab({ listings, onUpdate, getAuthHeaders, addToast }) {
  const [loading, setLoading] = useState({});

  const toggleListingStatus = async (listingId, currentStatus) => {
    setLoading((prev) => ({ ...prev, [listingId]: true }));
    try {
      const res = await fetch(`/api/founder/ideas/${listingId}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          addToast(`Listing ${!currentStatus ? "activated" : "paused"}`, "success");
          onUpdate();
        } else {
          addToast(data.error || "Failed to update listing", "error");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        addToast(errorData.error || "Failed to update listing", "error");
      }
    } catch (err) {
      console.error("Error updating listing:", err);
      addToast("Failed to update listing", "error");
    } finally {
      setLoading((prev) => ({ ...prev, [listingId]: false }));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Idea Listings</h2>
      </div>
      {listings.length === 0 ? (
        <div className="ui-card text-center py-12 rounded-xl">
          <p className="text-secondary mb-2">You haven't listed any ideas yet.</p>
          <p className="text-sm text-secondary">
            Turn your validated ideas into listings so collaborators can discover you.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className={`ui-card rounded-xl shadow-sm p-6 ${
              listing.is_active ? "border-default" : "border-default opacity-75"
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{listing.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      listing.is_active 
                        ? "badge-success" 
                        : "bg-surface text-secondary border border-default"
                    }`}>
                      {listing.is_active ? "Active" : "Paused"}
                    </span>
                    {listing.validation_score != null && typeof listing.validation_score === 'number' && (
                      <span className="px-2 py-1 bg-surface text-accent rounded text-xs font-semibold">
                        Score: {listing.validation_score.toFixed(1)} / 10
                      </span>
                    )}
                  </div>
                  <p className="text-secondary mb-3">{listing.brief_description}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {listing.industry && (
                      <span className="px-2 py-1 bg-app rounded text-sm">
                        {listing.industry}
                      </span>
                    )}
                    {listing.stage && (
                      <span className="px-2 py-1 bg-app rounded text-sm">
                        {listing.stage}
                      </span>
                    )}
                    {listing.skills_needed && listing.skills_needed.length > 0 && (
                      <span className="px-2 py-1 bg-app rounded text-sm">
                        Looking for: {listing.skills_needed.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleListingStatus(listing.id, listing.is_active)}
                  disabled={loading[listing.id]}
                  className={`ml-4 px-3 py-1 text-sm rounded-lg transition ${
                    listing.is_active
                      ? "ui-btn ui-btn-secondary"
                      : "ui-btn badge-success"
                  }`}
                >
                  {loading[listing.id] ? "..." : listing.is_active ? "Pause" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

