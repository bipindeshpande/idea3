import { useState, useEffect, useRef } from "react";

export default function ConnectionsTab({ connections, onUpdate, getAuthHeaders, addToast }) {
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
  const fetchedRef = useRef(new Set());

  useEffect(() => {
    // Get current connection IDs
    const currentIds = new Set(connections.map(conn => conn.id));
    
    // Remove IDs from ref that are no longer in connections (cleanup)
    fetchedRef.current.forEach(id => {
      if (!currentIds.has(id)) {
        fetchedRef.current.delete(id);
      }
    });

    connections.forEach((conn) => {
      // Only fetch if we haven't fetched this connection yet
      if (!fetchedRef.current.has(conn.id)) {
        fetchedRef.current.add(conn.id);
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
            // Remove from fetched set on error so we can retry
            fetchedRef.current.delete(conn.id);
          })
          .finally(() => {
            setLoading((prev) => {
              const newLoading = { ...prev };
              delete newLoading[conn.id];
              return newLoading;
            });
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

