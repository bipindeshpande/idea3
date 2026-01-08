import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import WorkspaceTopBar from "../components/workspace/WorkspaceTopBar.jsx";
import UICard from "../components/ui/ui-card.jsx";

function getWorkspaceMeta(pathname) {
 // Route-derived titles/subtitles so TopBar persists while Outlet swaps.
 if (pathname.startsWith("/dashboard/frameworks")) {
 return {
 title: null,
 subtitle: null,
 };
 }
 if (pathname.startsWith("/dashboard")) {
 return {
 title: "Workspace",
 subtitle: "Your saved ideas, validations, and insights.",
 };
 }
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
 if (pathname.startsWith("/psyche/questionnaire")) {
 return {
 title: "Decision & Work Style Assessment",
 subtitle: "Answer 12 questions to personalize your startup recommendations.",
 };
 }
 if (pathname.startsWith("/account")) {
 return {
 title: "Account",
 subtitle: "Manage your subscription, profile, and settings.",
 };
 }
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
 if (pathname.startsWith("/advisor")) {
 return {
 title: "Discover",
 subtitle: "Get personalized startup recommendations.",
 };
 }
 if (pathname.startsWith("/dashboard/runs")) {
 return {
 title: "History",
 subtitle: "Browse all previous discoveries and validations.",
 };
 }
 if (pathname.startsWith("/how-advisor-thinks")) {
 return {
 title: "How Advisor Thinks",
 subtitle: "Understand how recommendations are generated and what influences decisions.",
 };
 }
 return { title: null, subtitle: null };
}

export default function WorkspaceLayout() {
 const { pathname } = useLocation();
 const { title, subtitle } = getWorkspaceMeta(pathname);
 
 // Sidebar collapse state with localStorage persistence
 const [isCollapsed, setIsCollapsed] = useState(() => {
  if (typeof window !== "undefined") {
   const saved = localStorage.getItem("sidebarCollapsed");
   return saved === "true";
  }
  return false;
 });

 useEffect(() => {
  if (typeof window !== "undefined") {
   localStorage.setItem("sidebarCollapsed", String(isCollapsed));
  }
 }, [isCollapsed]);

 const handleToggleCollapse = () => {
  setIsCollapsed(!isCollapsed);
 };

 const sidebarWidth = isCollapsed ? "80px" : "280px";

 return (
 <div className="app-shell bg-app text-primary font-sans min-h-screen">
 <div className="page-wrap px-6 py-6">
 <div className="flex gap-6 flex-col lg:flex-row">
 {/* Persistent Sidebar - no key to prevent remounting, darker surface to differentiate */}
 <UICard variant="muted" className="ui-radius-page overflow-hidden h-fit lg:sticky lg:top-6 transition-all duration-300 flex-shrink-0" style={{ boxShadow: "0 1px 1px rgba(0,0,0,0.02)", background: "var(--surface-muted)", width: isCollapsed ? "80px" : "280px" }}>
 <Sidebar isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
 </UICard>

 {/* Right Pane - Content Area */}
      <div className="min-w-0 flex-1">
       <UICard variant="muted" className="ui-radius-page ui-pad-md shadow-soft">
        {title && <WorkspaceTopBar title={title} subtitle={subtitle} />}
        <div>
         <Outlet />
        </div>
       </UICard>
      </div>
 </div>
 </div>
 </div>
 );
}


