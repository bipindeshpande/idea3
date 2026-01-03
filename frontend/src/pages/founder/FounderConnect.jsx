import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import LoadingIndicator from "../../components/common/LoadingIndicator.jsx";
import { ToastContainer } from "../../components/common/Toast.jsx";
import CreditCounter from "../../components/founder/CreditCounter.jsx";
import ProfileTab from "../../components/founder/ProfileTab.jsx";
import ListingsTab from "../../components/founder/ListingsTab.jsx";
import BrowseIdeasTab from "../../components/founder/BrowseIdeasTab.jsx";
import BrowsePeopleTab from "../../components/founder/BrowsePeopleTab.jsx";
import ConnectionsTab from "../../components/founder/ConnectionsTab.jsx";
import FounderConnectTabs from "../../components/founder/FounderConnectTabs.jsx";
import { useFounderConnect } from "../../hooks/useFounderConnect.js";
import { useToast } from "../../hooks/useToast.js";

export default function FounderConnectPage() {
  const { user, isAuthenticated, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");
  const { toasts, addToast, removeToast } = useToast();
  
  const {
    loading,
    profile,
    listings,
    browseIdeas,
    browsePeople,
    connections,
    usage,
    error,
    loadInitialData,
    loadListings,
    loadBrowseIdeas,
    loadBrowsePeople,
  } = useFounderConnect(getAuthHeaders);

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
  }, [isAuthenticated, navigate, searchParams, loadInitialData]);

  useEffect(() => {
    if (activeTab === "listings") {
      loadListings();
    } else if (activeTab === "browse-ideas") {
      loadBrowseIdeas();
    } else if (activeTab === "browse-people") {
      loadBrowsePeople();
    }
  }, [activeTab, loadListings, loadBrowseIdeas, loadBrowsePeople]);

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
        <FounderConnectTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          connections={connections}
        />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "profile" && (
            <ProfileTab profile={profile} onUpdate={loadInitialData} getAuthHeaders={getAuthHeaders} addToast={addToast} />
          )}
          {activeTab === "listings" && (
            <ListingsTab 
              listings={listings} 
              onUpdate={loadListings} 
              getAuthHeaders={getAuthHeaders} 
              addToast={addToast} 
            />
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
            <ConnectionsTab 
              connections={connections} 
              onUpdate={loadInitialData} 
              getAuthHeaders={getAuthHeaders} 
              addToast={addToast} 
            />
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
