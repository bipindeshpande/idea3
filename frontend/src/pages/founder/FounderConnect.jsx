import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import LoadingIndicator from "../../components/common/LoadingIndicator.jsx";
import { ToastContainer } from "../../components/common/Toast.jsx";
import CreditCounter from "../../components/founder/CreditCounter.jsx";
import ProfileTab from "../../components/founder/ProfileTab.jsx";
import UIButton from "../../components/ui/ui-button.jsx";

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
 <div>
 <p className="text-sm text-secondary">
 Your saved ideas, validations, and insights appear here. Choose an item to continue working.
 </p>

 {/* Credits Display - Updated with subscription tier messaging */}
 <CreditCounter 
 credits={connectionCredits} 
 subscriptionType={subscriptionType}
 onUpgrade={() => navigate("/pricing")}
 />

 {/* Tabs */}
 <div className="mb-6 border-b border-default">
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
    ? "border-accent text-primary"
    : "border-transparent text-secondary hover:text-accent-hover hover:border-default"
 }`}
 >
 {tab.label}
 {tab.id === "connections" && (connections.sent?.length > 0 || connections.received?.length > 0) && (
 <span className="ml-2 px-2 py-0.5 text-xs bg-surface text-accent rounded-full">
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
 <div className="mt-4 p-4 rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
 <p className="text-primary text-primary leading-relaxed font-semibold">{error}</p>
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
 className="px-4 py-2 border rounded-lg hover:bg-surface hover:bg-surface text-sm"
 >
 Clear Filters
 </button>
 </div>
 </div>
 )}
 </div>

 {ideas.length === 0 ? (
 <div className="text-center py-12 bg-surface rounded-xl border border-default">
 <p className="text-secondary text-secondary mb-2">No matching ideas found yet.</p>
 <p className="text-sm text-secondary text-secondary">Check back later or list your own idea to get started.</p>
 </div>
 ) : (
 <div className="space-y-4">
 {ideas.map((idea) => {
 const matchReason = getMatchReason(idea);
 return (
 <div key={idea.id} className="bg-surface rounded-xl shadow-sm border border-default p-6">
 <h3 className="font-bold text-lg mb-2">{idea.title}</h3>
 <p className="text-secondary text-secondary mb-4">{idea.brief_description}</p>
 <div className="flex flex-wrap gap-2 mb-3">
{idea.industry && <span className="px-2 py-1 bg-surface rounded text-sm">{idea.industry}</span>}
{idea.stage && <span className="px-2 py-1 bg-surface rounded text-sm">{idea.stage}</span>}
{idea.commitment_level && <span className="px-2 py-1 bg-surface rounded text-sm">{idea.commitment_level}</span>}
 </div>
 {matchReason && (
 <p className="text-sm text-accent text-accent mb-3 font-medium">{matchReason}</p>
 )}
 {idea.founder && (
 <div className="mb-4 text-sm text-secondary text-secondary">
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
 <div className="flex gap-2 border-b border-default">
 <button
 onClick={() => setActiveSubtab("incoming")}
 className={`px-4 py-2 font-medium text-sm transition ${
 activeSubtab === "incoming"
? "border-b-2 border-default text-accent"
: "text-secondary hover:text-primary"
 }`}
 >
 Incoming {incomingRequests.length > 0 && `(${incomingRequests.length})`}
 </button>
 <button
 onClick={() => setActiveSubtab("sent")}
 className={`px-4 py-2 font-medium text-sm transition ${
 activeSubtab === "sent"
? "border-b-2 border-default text-accent"
: "text-secondary hover:text-primary"
 }`}
 >
 Sent {sentRequests.length > 0 && `(${sentRequests.length})`}
 </button>
 <button
 onClick={() => setActiveSubtab("accepted")}
 className={`px-4 py-2 font-medium text-sm transition ${
 activeSubtab === "accepted"
? "border-b-2 border-default text-accent"
: "text-secondary hover:text-primary"
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
 <div className="text-center py-12 bg-surface rounded-xl border border-default">
 <p className="text-secondary text-secondary mb-2">No incoming requests.</p>
 <p className="text-sm text-secondary text-secondary">When other founders send you connection requests, they'll appear here.</p>
 </div>
 ) : (
 <div className="space-y-4">
 {incomingRequests.map((req) => (
 <div key={req.id} className="bg-surface rounded-xl shadow-sm border border-default p-6">
 <div className="mb-3">
 <p className="text-secondary text-secondary mb-2">
 {req.message || "Connection request from an anonymous founder"}
 </p>
 <p className="text-xs text-secondary text-secondary mb-3">
 Accepting will reveal both identities and allow you to contact each other.
 </p>
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => handleRespond(req.id, "accept")}
 className="px-4 py-2 bg-accent text-on-accent rounded-lg hover:bg-accent-hover"
 >
 Accept
 </button>
 <button
 onClick={() => handleRespond(req.id, "decline")}
 className="px-4 py-2 border rounded-lg hover:bg-surface hover:bg-surface"
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
 <div className="text-center py-12 bg-surface rounded-xl border border-default">
 <p className="text-secondary text-secondary mb-2">No sent requests.</p>
 <p className="text-sm text-secondary text-secondary">Your pending connection requests will appear here.</p>
 </div>
 ) : (
 <div className="space-y-4">
 {sentRequests.map((req) => (
 <div key={req.id} className="bg-surface rounded-xl shadow-sm border border-default p-6">
 <p className="text-secondary text-secondary mb-2">
 {req.message || "Connection request sent"}
 </p>
 <p className="text-sm text-secondary text-secondary mb-3">Status: Pending</p>
 <button
 onClick={() => handleWithdraw(req.id)}
 className="ui-btn ui-btn-secondary px-4 py-2 rounded-lg"
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
 <div className="text-center py-12 bg-surface rounded-xl border border-default">
 <p className="text-secondary text-secondary mb-2">No accepted connections yet.</p>
 <p className="text-sm text-secondary text-secondary">Accepted connections will show full contact information here.</p>
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
 <div key={conn.id} className="bg-surface bg-surface rounded-xl border border-default border-default p-6">
 {isLoading ? (
 <p className="text-secondary text-secondary">Loading contact information...</p>
 ) : contact ? (
 <>
 <h3 className="font-semibold mb-3 text-accent text-accent">
 {contact.full_name || "Connection"}
 </h3>
 <div className="space-y-2">
 {contact.email && <p><strong>Email:</strong> {contact.email}</p>}
 {contact.linkedin_url && (
 <p>
 <strong>LinkedIn:</strong>{" "}
 <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
 {contact.linkedin_url}
 </a>
 </p>
 )}
 {contact.website_url && (
 <p>
 <strong>Website:</strong>{" "}
 <a href={contact.website_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
 {contact.website_url}
 </a>
 </p>
 )}
 {connectionRequest?.idea_listing && (
 <div className="mt-3 p-3 bg-surface rounded-lg">
 <p className="text-sm font-medium mb-1">Connected via:</p>
 <p className="text-sm">{connectionRequest.idea_listing.title}</p>
 </div>
 )}
 </div>
 </>
 ) : (
 <p className="text-secondary text-secondary">Connection details unavailable</p>
 )}
 </div>
 );
 })}
 </div>
 );
}
