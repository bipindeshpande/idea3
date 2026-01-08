import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import WorkspaceTopBar from "../components/workspace/WorkspaceTopBar.jsx";
import UICard from "../components/ui/ui-card.jsx";
import { getWorkspaceMeta } from "../utils/workspaceMeta.js";

export default function WorkspaceLayout() {
 const { pathname, search } = useLocation();
 const { title, subtitle } = getWorkspaceMeta(pathname, search);
 
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


