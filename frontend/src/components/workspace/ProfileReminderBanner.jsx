import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProfileReminderCard({ isCollapsed }) {
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [missingItems, setMissingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const checkProfiles = async () => {
      try {
        const items = [];
        
        // Check Founder Profile
        try {
          const profileResponse = await fetch("/api/founder/profile", {
            headers: getAuthHeaders(),
          });
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            // Check if profile is incomplete (missing key fields)
            if (!profileData.profile || 
                !profileData.profile.full_name || 
                !profileData.profile.bio || 
                !profileData.profile.primary_skills ||
                profileData.profile.primary_skills.length === 0) {
              items.push({
                type: "founder",
                label: "Founder Profile",
                shortLabel: "Profile",
                link: "/founder-connect?tab=profile",
              });
            }
          } else {
            // No profile exists
            items.push({
              type: "founder",
              label: "Founder Profile",
              shortLabel: "Profile",
              link: "/founder-connect?tab=profile",
            });
          }
        } catch (err) {
          // API error, assume missing
          items.push({
            type: "founder",
            label: "Founder Profile",
            shortLabel: "Profile",
            link: "/founder-connect?tab=profile",
          });
        }

        // Check Decision & Work Style
        try {
          const psycheResponse = await fetch("/api/psyche/profile", {
            headers: getAuthHeaders(),
          });
          if (psycheResponse.ok) {
            const psycheData = await psycheResponse.json();
            if (!psycheData.profile || !psycheData.profile.decision_style) {
              items.push({
                type: "psyche",
                label: "Decision & Work Style",
                shortLabel: "Work Style",
                link: "/psyche/questionnaire",
              });
            }
          } else {
            // No psyche profile exists
            items.push({
              type: "psyche",
              label: "Decision & Work Style",
              shortLabel: "Work Style",
              link: "/psyche/questionnaire",
            });
          }
        } catch (err) {
          // API error, assume missing
          items.push({
            type: "psyche",
            label: "Decision & Work Style",
            shortLabel: "Work Style",
            link: "/psyche/questionnaire",
          });
        }

        setMissingItems(items);
      } catch (error) {
        console.error("Error checking profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    checkProfiles();
    
    // Re-check every 30 seconds to catch profile updates
    const interval = setInterval(checkProfiles, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, getAuthHeaders]);

  // Don't show if loading, not authenticated, or nothing missing
  if (loading || missingItems.length === 0 || !isAuthenticated) {
    return null;
  }

  // Collapsed state - show icon only
  if (isCollapsed) {
    return (
      <div className="px-2">
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-2 flex items-center justify-center">
          <Link
            to={missingItems[0].link}
            className="text-accent hover:text-accent/80 transition-colors"
            title={missingItems.map(item => item.label).join(", ")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // Expanded state - show full card
  return (
    <div className="px-3 mt-2">
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 space-y-2">
        <div className="flex items-start gap-2">
          <svg
            className="w-4 h-4 text-accent flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary leading-tight mb-1.5">
              Complete your profile
            </p>
            <div className="space-y-1">
              {missingItems.map((item) => (
                <Link
                  key={item.type}
                  to={item.link}
                  className="block text-xs text-accent hover:text-accent/80 hover:underline transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

