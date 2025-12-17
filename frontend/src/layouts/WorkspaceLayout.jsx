import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import WorkspaceTopBar from "../components/workspace/WorkspaceTopBar.jsx";
import UICard from "../components/ui/ui-card.jsx";

function getWorkspaceMeta(pathname) {
 // Route-derived titles/subtitles so TopBar persists while Outlet swaps.
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
 if (pathname.startsWith("/account")) {
 return {
 title: "Account",
 subtitle: "Manage your subscription, profile, and settings.",
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
 return { title: null, subtitle: null };
}

export default function WorkspaceLayout() {
 const { pathname } = useLocation();
 const { title, subtitle } = getWorkspaceMeta(pathname);

 return (
 <div className="app-shell bg-app text-primary font-sans min-h-screen">
 <div className="page-wrap px-6 py-6">
 <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
 {/* Persistent Sidebar - no key to prevent remounting, darker surface to differentiate */}
 <UICard variant="muted" className="ui-radius-page overflow-hidden h-fit lg:sticky lg:top-6" style={{ boxShadow: "0 1px 1px rgba(0,0,0,0.02)", background: "var(--surface-muted)" }}>
 <Sidebar />
 </UICard>

 {/* Right Pane - Content Area */}
 <div className="min-w-0">
 <UICard variant="muted" className="ui-radius-page ui-pad-md shadow-soft">
 <WorkspaceTopBar title={title} subtitle={subtitle} />
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


