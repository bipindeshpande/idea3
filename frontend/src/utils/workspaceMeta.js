/**
 * Workspace Metadata Utility
 * 
 * Provides route-derived titles and subtitles for workspace pages.
 * Used by WorkspaceLayout to display consistent page headers.
 */

/**
 * Get workspace metadata (title and subtitle) based on the current route
 * @param {string} pathname - The current pathname
 * @param {string} search - The current search query string (optional)
 * @returns {{title: string | null, subtitle: string | null}}
 */
export function getWorkspaceMeta(pathname, search = "") {
  // Route-derived titles/subtitles so TopBar persists while Outlet swaps.
  
  // Dashboard routes (order matters - check specific routes before general ones)
  if (pathname.startsWith("/dashboard/frameworks")) {
    // Check if we're in create mode via URL parameter
    const searchParams = new URLSearchParams(search);
    const isCreating = searchParams.get("mode") === "create";
    
    if (isCreating) {
      return {
        title: "Create Framework",
        subtitle: "Create a new validation framework from a template.",
      };
    }
    
    return {
      title: "Templates & Frameworks",
      subtitle: "Browse templates and manage your validation frameworks.",
    };
  }
  
  if (pathname.startsWith("/dashboard/runs")) {
    return {
      title: "History",
      subtitle: "Browse all previous discoveries and validations.",
    };
  }
  
  if (pathname.startsWith("/dashboard/profile")) {
    return {
      title: "Profile Analysis",
      subtitle: "Comprehensive analysis of your entrepreneurial profile, strengths, and opportunities.",
    };
  }
  
  if (pathname.startsWith("/dashboard/recommendations")) {
    // Check if it's a detail page (has ideaIndex)
    const ideaIndexMatch = pathname.match(/\/dashboard\/recommendations\/(\d+)/);
    if (ideaIndexMatch) {
      return {
        title: "Recommendation Detail",
        subtitle: "Detailed analysis of your selected startup recommendation.",
      };
    }
    return {
      title: "Recommendations",
      subtitle: "Review AI-generated startup ideas, financial outlook, and execution roadmap.",
    };
  }
  
  if (pathname.startsWith("/dashboard")) {
    return {
      title: "Workspace",
      subtitle: "Your saved ideas, validations, and insights.",
    };
  }
  
  // Founder routes
  if (pathname.startsWith("/founder-connect")) {
    return {
      title: "Founder Network",
      subtitle: "Connect with peers aligned with your working style.",
    };
  }
  
  if (pathname.startsWith("/founder-psychology")) {
    return {
      title: "Founder Psychology",
      subtitle: "Capture your decision style and working patterns.",
    };
  }
  
  // Psyche routes
  if (pathname.startsWith("/psyche/questionnaire")) {
    return {
      title: "Decision & Work Style Assessment",
      subtitle: "Answer 12 questions to personalize your startup recommendations.",
    };
  }
  
  // Account routes
  if (pathname.startsWith("/account")) {
    return {
      title: "Account",
      subtitle: "Manage your subscription, profile, and settings.",
    };
  }
  
  // Validation routes
  if (pathname.startsWith("/validate-result")) {
    return {
      title: "Validation Results",
      subtitle: "Review your idea validation scores and recommendations.",
    };
  }
  
  if (pathname.startsWith("/validate-idea")) {
    return {
      title: "Validate Idea",
      subtitle: "Assess the viability of your startup idea.",
    };
  }
  
  // Discovery routes
  if (pathname.startsWith("/advisor")) {
    return {
      title: "Discover Ideas",
      subtitle: "Get personalized startup recommendations.",
    };
  }
  
  // Resources routes
  if (pathname.startsWith("/how-advisor-thinks")) {
    return {
      title: "How Advisor Thinks",
      subtitle: "Understand how recommendations are generated and what influences decisions.",
    };
  }
  
  // Help routes
  if (pathname.startsWith("/help/validate-idea")) {
    return {
      title: "How to Validate Your Idea",
      subtitle: "Standard operating procedure",
    };
  }
  
  if (pathname.startsWith("/help/discover")) {
    return {
      title: "How to Discover Ideas",
      subtitle: "Standard operating procedure",
    };
  }
  
  if (pathname.startsWith("/help/founder-network")) {
    return {
      title: "How to Use Founder Network",
      subtitle: "Standard operating procedure",
    };
  }
  
  if (pathname.startsWith("/help/frameworks")) {
    return {
      title: "How to Use Templates & Frameworks",
      subtitle: "Standard operating procedure",
    };
  }
  
  if (pathname.startsWith("/help/workspace")) {
    return {
      title: "How to Use Workspace",
      subtitle: "Standard operating procedure",
    };
  }
  
  if (pathname.startsWith("/help/account")) {
    return {
      title: "How to Use Account",
      subtitle: "Standard operating procedure",
    };
  }
  
  // Default: no metadata
  return { title: null, subtitle: null };
}

