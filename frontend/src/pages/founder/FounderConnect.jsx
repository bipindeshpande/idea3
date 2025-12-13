import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import LoadingIndicator from "../../components/common/LoadingIndicator.jsx";
import { ToastContainer } from "../../components/common/Toast.jsx";
import CreditCounter from "../../components/founder/CreditCounter.jsx";
import ProfileTab from "../../components/founder/ProfileTab.jsx";
import Button from "../../components/ui/Button.jsx";

export default function FounderConnectPage() {
  const { user, isAuthenticated, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [browseIdeas, setBrowseIdeas] = useState([]);
  const [browsePeople, setBrowsePeople] = useState([]);
  const [connections, setConnections] = useState({ sent: [], received: [] });
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadInitialData();
    
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [isAuthenticated, navigate, searchParams]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, usageRes, connectionsRes] = await Promise.all([
        fetch("/api/founder/profile", { headers: getAuthHeaders() }),
        fetch("/api/user/usage", { headers: getAuthHeaders() }),
        fetch("/api/founder/connections", { headers: getAuthHeaders() }),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setProfile(profileData.profile);
        }
      }

      if (usageRes.ok) {
        const usageData = await usageRes.json();
        if (usageData.success) {
          setUsage(usageData.usage);
        }
      }

      if (connectionsRes.ok) {
        const connectionsData = await connectionsRes.json();
        if (connectionsData.success) {
          setConnections(connectionsData);
        }
      }
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error("Error loading founder connect data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadListings = async () => {
    try {
      const res = await fetch("/api/founder/ideas", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setListings(data.listings || []);
        }
      }
    } catch (err) {
      console.error("Error loading listings:", err);
    }
  };

  const loadBrowseIdeas = async (filters = {}) => {
    try {
      const params = new URLSearchParams({ page: "1", per_page: "20", ...filters });
      const res = await fetch(`/api/founder/ideas/browse?${params}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBrowseIdeas(data.listings || []);
        }
      }
    } catch (err) {
      console.error("Error loading browse ideas:", err);
    }
  };

  const loadBrowsePeople = async (filters = {}) => {
    try {
      const params = new URLSearchParams({ page: "1", per_page: "20", ...filters });
      const res = await fetch(`/api/founder/people/browse?${params}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBrowsePeople(data.profiles || []);
        }
      }
    } catch (err) {
      console.error("Error loading browse people:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "listings") {
      loadListings();
    } else if (activeTab === "browse-ideas") {
      loadBrowseIdeas();
    } else if (activeTab === "browse-people") {
      loadBrowsePeople();
    }
  }, [activeTab]);

  if (loading) {
    return <LoadingIndicator message="Loading Founder Connect..." />;
  }

  const connectionCredits = usage?.connections || { used: 0, limit: 0, remaining: 0 };
  const subscriptionType = user?.subscription_type || "free";

  return (
    <>
      <Seo
        title="Founder Connect - Find Co-Founders & Collaborators | IdeaBunch"
        description="Connect with other founders, find co-founders, and collaborate on startup ideas."
      />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 relative">
          <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-indigo-300 opacity-[0.09] blur-2xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="mb-4">
              <Button 
                onClick={() => navigate("/dashboard")} 
                variant="secondary" 
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
              Founder Connect
            </h1>
            <p className="text-[15px] text-gray-700 leading-relaxed mb-8">
              Connect with other founders, find co-founders, and collaborate on startup ideas.
            </p>
          </div>
        </div>

        {/* Credits Display - Updated with subscription tier messaging */}
        <CreditCounter 
          credits={connectionCredits} 
          subscriptionType={subscriptionType}
          onUpgrade={() => navigate("/pricing")}
        />

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: "profile", label: "My Profile" },
              { id: "listings", label: "My Listings" },
              { id: "browse-ideas", label: "Browse Ideas" },
              { id: "browse-people", label: "Browse Founders" },
              { id: "connections", label: "Connections" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.id === "connections" && (connections.sent?.length > 0 || connections.received?.length > 0) && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                    {(connections.sent?.length || 0) + (connections.received?.length || 0)}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "profile" && (
            <ProfileTab profile={profile} onUpdate={loadInitialData} getAuthHeaders={getAuthHeaders} addToast={addToast} />
          )}
          {activeTab === "listings" && (
            <ListingsTab listings={listings} onUpdate={loadListings} getAuthHeaders={getAuthHeaders} addToast={addToast} />
          )}
          {activeTab === "browse-ideas" && (
            <BrowseIdeasTab 
              ideas={browseIdeas} 
              onUpdate={loadBrowseIdeas} 
              getAuthHeaders={getAuthHeaders} 
              credits={connectionCredits} 
              subscriptionType={subscriptionType}
              addToast={addToast}
              connections={connections}
              onConnectionsUpdate={loadInitialData}
            />
          )}
          {activeTab === "browse-people" && (
            <BrowsePeopleTab 
              people={browsePeople} 
              onUpdate={loadBrowsePeople} 
              getAuthHeaders={getAuthHeaders} 
              credits={connectionCredits}
              subscriptionType={subscriptionType}
              addToast={addToast}
              connections={connections}
              onConnectionsUpdate={loadInitialData}
            />
          )}
          {activeTab === "connections" && (
            <ConnectionsTab connections={connections} onUpdate={loadInitialData} getAuthHeaders={getAuthHeaders} addToast={addToast} />
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7">
            <p className="text-[15px] text-gray-700 leading-relaxed font-semibold">{error}</p>
          </div>
        )}

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </>
  );
}



// Listings Tab Component - Updated with validation data and Active/Paused toggle
function ListingsTab({ listings, onUpdate, getAuthHeaders, addToast }) {
  const [loading, setLoading] = useState({});

  const toggleListingStatus = async (listingId, currentStatus) => {
    setLoading({ ...loading, [listingId]: true });
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
      setLoading({ ...loading, [listingId]: false });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Idea Listings</h2>
      </div>
      {listings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400 mb-2">You haven't listed any ideas yet.</p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Turn your validated ideas into listings so collaborators can discover you.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-6 ${
              listing.is_active ? "border-slate-200 dark:border-slate-700" : "border-slate-300 dark:border-slate-600 opacity-75"
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{listing.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      listing.is_active 
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400" 
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                    }`}>
                      {listing.is_active ? "Active" : "Paused"}
                    </span>
                    {listing.validation_score != null && typeof listing.validation_score === 'number' && (
                      <span className="px-2 py-1 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-400 rounded text-xs font-semibold">
                        Score: {listing.validation_score.toFixed(1)} / 10
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">{listing.brief_description}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {listing.industry && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm">
                        {listing.industry}
                      </span>
                    )}
                    {listing.stage && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm">
                        {listing.stage}
                      </span>
                    )}
                    {listing.skills_needed && listing.skills_needed.length > 0 && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm">
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
                      ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800"
                      : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800"
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

// Browse Ideas Tab Component - Updated with filters and match reasons
function BrowseIdeasTab({ ideas, onUpdate, getAuthHeaders, credits, subscriptionType, addToast, connections, onConnectionsUpdate }) {
  const [filters, setFilters] = useState({
    industry: "",
    stage: "",
    skills_needed: "",
    commitment_level: "",
    location: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadFilteredIdeas();
  }, [filters]);

  const loadFilteredIdeas = () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v)
    );
    onUpdate(activeFilters);
  };

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
            className="px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <strong>Privacy:</strong> Profiles are anonymized. Names and contact details are only shared after both sides accept.
          </p>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Industry</label>
              <input
                type="text"
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                placeholder="Filter by industry"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
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
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                placeholder="Filter by skills"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Commitment Level</label>
              <select
                value={filters.commitment_level}
                onChange={(e) => setFilters({ ...filters, commitment_level: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
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
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                placeholder="Filter by location"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ industry: "", stage: "", skills_needed: "", commitment_level: "", location: "" })}
                className="px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400 mb-2">No matching ideas found yet.</p>
          <p className="text-sm text-slate-500 dark:text-slate-500">Check back later or list your own idea to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea) => {
            const matchReason = getMatchReason(idea);
            return (
              <div key={idea.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-bold text-lg mb-2">{idea.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{idea.brief_description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {idea.industry && <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm">{idea.industry}</span>}
                  {idea.stage && <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm">{idea.stage}</span>}
                  {idea.commitment_level && <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm">{idea.commitment_level}</span>}
                </div>
                {matchReason && (
                  <p className="text-sm text-brand-600 dark:text-brand-400 mb-3 font-medium">{matchReason}</p>
                )}
                {idea.founder && (
                  <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                    <p>Looking for: {idea.founder.looking_for || "Collaborators"}</p>
                    {idea.founder.primary_skills && idea.founder.primary_skills.length > 0 && (
                      <p className="mt-1">Skills: {idea.founder.primary_skills.join(", ")}</p>
                    )}
                  </div>
                )}
                <button
                  onClick={() => handleConnect(idea)}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

// Browse People Tab Component - Updated with filters and match reasons
function BrowsePeopleTab({ people, onUpdate, getAuthHeaders, credits, subscriptionType, addToast, connections, onConnectionsUpdate }) {
  const [filters, setFilters] = useState({
    skills: "",
    industries: "",
    commitment_level: "",
    location: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadFilteredPeople();
  }, [filters]);

  const loadFilteredPeople = () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v)
    );
    onUpdate(activeFilters);
  };

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
            className="px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <strong>Privacy:</strong> Profiles are anonymized. Names and contact details are only shared after both sides accept.
          </p>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Skills Offered</label>
              <input
                type="text"
                value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                placeholder="Filter by skills"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Industries</label>
              <input
                type="text"
                value={filters.industries}
                onChange={(e) => setFilters({ ...filters, industries: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                placeholder="Filter by industries"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Commitment Level</label>
              <select
                value={filters.commitment_level}
                onChange={(e) => setFilters({ ...filters, commitment_level: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
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
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                placeholder="Filter by location"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ skills: "", industries: "", commitment_level: "", location: "" })}
                className="px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {people.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400 mb-2">No matching founders found yet.</p>
          <p className="text-sm text-slate-500 dark:text-slate-500">Check back later or create your profile to get discovered.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {people.map((person) => {
            const matchReason = getMatchReason(person);
            return (
              <div key={person.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">Founder Profile</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">{person.looking_for || "Looking for collaborators"}</p>
                    {matchReason && (
                      <p className="text-sm text-brand-600 dark:text-brand-400 mb-2 font-medium">{matchReason}</p>
                    )}
                    {person.primary_skills && person.primary_skills.length > 0 && (
                      <div className="flex gap-2 flex-wrap mb-2">
                        {person.primary_skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm">{skill}</span>
                        ))}
                      </div>
                    )}
                    {person.commitment_level && (
                      <p className="text-sm text-slate-500 dark:text-slate-500">Commitment: {person.commitment_level}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleConnect(person.id)}
                    className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed ml-4 whitespace-nowrap"
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

// Connections Tab Component - Updated with better organization
function ConnectionsTab({ connections, onUpdate, getAuthHeaders, addToast }) {
  const [activeSubtab, setActiveSubtab] = useState("incoming");

  const handleRespond = async (connectionId, action) => {
    try {
      const res = await fetch(`/api/founder/connections/${connectionId}/respond`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          addToast(action === "accept" ? "Connection accepted!" : "Connection declined", "success");
          onUpdate();
        } else {
          addToast(data.error || "Failed to respond to request", "error");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        addToast(errorData.error || "Failed to respond to request", "error");
      }
    } catch (err) {
      console.error("Error responding to connection:", err);
      addToast("Failed to respond to connection request", "error");
    }
  };

  const handleWithdraw = async (connectionId) => {
    try {
      const res = await fetch(`/api/founder/connections/${connectionId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          addToast("Request withdrawn", "success");
          onUpdate();
        } else {
          addToast(data.error || "Failed to withdraw request", "error");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        addToast(errorData.error || "Failed to withdraw request", "error");
      }
    } catch (err) {
      console.error("Error withdrawing connection:", err);
      addToast("Failed to withdraw connection request", "error");
    }
  };

  const getConnectionDetail = async (connectionId) => {
    try {
      const res = await fetch(`/api/founder/connections/${connectionId}/detail`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.error("Error fetching connection detail:", err);
    }
    return null;
  };

  const incomingRequests = (connections.received || []).filter(req => req.status === "pending");
  const sentRequests = (connections.sent || []).filter(req => req.status === "pending");
  const acceptedConnections = [
    ...(connections.received || []).filter(req => req.status === "accepted"),
    ...(connections.sent || []).filter(req => req.status === "accepted"),
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Connections</h2>
        
        {/* Subtabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveSubtab("incoming")}
            className={`px-4 py-2 font-medium text-sm transition ${
              activeSubtab === "incoming"
                ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            Incoming {incomingRequests.length > 0 && `(${incomingRequests.length})`}
          </button>
          <button
            onClick={() => setActiveSubtab("sent")}
            className={`px-4 py-2 font-medium text-sm transition ${
              activeSubtab === "sent"
                ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            Sent {sentRequests.length > 0 && `(${sentRequests.length})`}
          </button>
          <button
            onClick={() => setActiveSubtab("accepted")}
            className={`px-4 py-2 font-medium text-sm transition ${
              activeSubtab === "accepted"
                ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            Accepted {acceptedConnections.length > 0 && `(${acceptedConnections.length})`}
          </button>
        </div>
      </div>

      {/* Incoming Requests */}
      {activeSubtab === "incoming" && (
        <div>
          {incomingRequests.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-400 mb-2">No incoming requests.</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">When other founders send you connection requests, they'll appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((req) => (
                <div key={req.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <div className="mb-3">
                    <p className="text-slate-600 dark:text-slate-400 mb-2">
                      {req.message || "Connection request from an anonymous founder"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">
                      Accepting will reveal both identities and allow you to contact each other.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(req.id, "accept")}
                      className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, "decline")}
                      className="px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sent Requests */}
      {activeSubtab === "sent" && (
        <div>
          {sentRequests.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-400 mb-2">No sent requests.</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">Your pending connection requests will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sentRequests.map((req) => (
                <div key={req.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <p className="text-slate-600 dark:text-slate-400 mb-2">
                    {req.message || "Connection request sent"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mb-3">Status: Pending</p>
                  <button
                    onClick={() => handleWithdraw(req.id)}
                    className="px-4 py-2 border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  >
                    Withdraw Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Accepted Connections */}
      {activeSubtab === "accepted" && (
        <AcceptedConnectionsList 
          connections={acceptedConnections} 
          getAuthHeaders={getAuthHeaders} 
        />
      )}
    </div>
  );
}

// Accepted Connections List Component
function AcceptedConnectionsList({ connections, getAuthHeaders }) {
  const [connectionDetails, setConnectionDetails] = useState({});
  const [loading, setLoading] = useState({});

  useEffect(() => {
    connections.forEach((conn) => {
      if (!connectionDetails[conn.id] && !loading[conn.id]) {
        setLoading((prev) => ({ ...prev, [conn.id]: true }));
        fetch(`/api/founder/connections/${conn.id}/detail`, {
          headers: getAuthHeaders(),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setConnectionDetails((prev) => ({ ...prev, [conn.id]: data.connection_request || data }));
            }
          })
          .catch((err) => {
            console.error("Error fetching connection detail:", err);
          })
          .finally(() => {
            setLoading((prev) => ({ ...prev, [conn.id]: false }));
          });
      }
    });
  }, [connections, getAuthHeaders]);

  if (connections.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-slate-600 dark:text-slate-400 mb-2">No accepted connections yet.</p>
        <p className="text-sm text-slate-500 dark:text-slate-500">Accepted connections will show full contact information here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {connections.map((conn) => {
        const detail = connectionDetails[conn.id];
        const isLoading = loading[conn.id];
        const connectionRequest = detail?.connection_request || detail;
        const contact = connectionRequest?.sender || connectionRequest?.recipient;

        return (
          <div key={conn.id} className="bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800 p-6">
            {isLoading ? (
              <p className="text-slate-600 dark:text-slate-400">Loading contact information...</p>
            ) : contact ? (
              <>
                <h3 className="font-semibold mb-3 text-brand-900 dark:text-brand-100">
                  {contact.full_name || "Connection"}
                </h3>
                <div className="space-y-2">
                  {contact.email && <p><strong>Email:</strong> {contact.email}</p>}
                  {contact.linkedin_url && (
                    <p>
                      <strong>LinkedIn:</strong>{" "}
                      <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                        {contact.linkedin_url}
                      </a>
                    </p>
                  )}
                  {contact.website_url && (
                    <p>
                      <strong>Website:</strong>{" "}
                      <a href={contact.website_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                        {contact.website_url}
                      </a>
                    </p>
                  )}
                  {connectionRequest?.idea_listing && (
                    <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <p className="text-sm font-medium mb-1">Connected via:</p>
                      <p className="text-sm">{connectionRequest.idea_listing.title}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">Connection details unavailable</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
