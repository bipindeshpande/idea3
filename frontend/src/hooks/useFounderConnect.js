import { useState, useCallback } from "react";

export function useFounderConnect(getAuthHeaders) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [browseIdeas, setBrowseIdeas] = useState([]);
  const [browsePeople, setBrowsePeople] = useState([]);
  const [connections, setConnections] = useState({ sent: [], received: [] });
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState(null);

  const loadInitialData = useCallback(async () => {
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
  }, [getAuthHeaders]);

  const loadListings = useCallback(async () => {
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
  }, [getAuthHeaders]);

  const loadBrowseIdeas = useCallback(async (filters = {}) => {
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
  }, [getAuthHeaders]);

  const loadBrowsePeople = useCallback(async (filters = {}) => {
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
  }, [getAuthHeaders]);

  return {
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
  };
}

