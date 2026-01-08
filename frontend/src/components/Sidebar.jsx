import { NavLink } from "react-router-dom";

const nav = [
 { to: "/dashboard", label: "View Workspace", icon: "📊" },
 { to: "/validate-idea", label: "Validate Idea", icon: "✓" },
 { to: "/advisor", label: "Discover Ideas", icon: "💡" },
 { to: "/dashboard/frameworks", label: "Templates & Frameworks", icon: "📋" },
 { to: "/founder-connect", label: "Find Founders", icon: "🤝" },
 { to: "/account", label: "Manage Account", icon: "⚙️" },
];

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
 return (
 <aside className="h-full w-full">
 <div className={`px-5 pt-7 pb-5 ${isCollapsed ? "px-3" : ""}`}>
 <div className="flex items-center justify-between">
 <div className={`text-base font-bold tracking-tight text-primary ${isCollapsed ? "hidden" : ""}`}>
  Idea Bunch
 </div>
 <button
  onClick={onToggleCollapse}
  className="ml-auto p-1.5 rounded-md hover:bg-surface-hover transition-colors text-secondary hover:text-primary focus-visible:outline-accent"
  aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
  title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
 >
  {isCollapsed ? (
   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
   </svg>
  ) : (
   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
   </svg>
  )}
 </button>
 </div>
 <div className={`mt-1 text-xs text-secondary ${isCollapsed ? "hidden" : ""}`}>Startup advisor</div>
 </div>
 <nav className={`pb-6 ${isCollapsed ? "px-2" : "px-3"}`}>
 {nav.map((item) => (
 <NavLink
 key={item.to}
 to={item.to}
 className={({ isActive }) =>
 [
 "flex items-center gap-3 ui-radius-btn py-2.5 text-sm font-medium transition leading-normal",
            isCollapsed ? "px-2 justify-center" : "px-3",
            isActive
              ? "bg-surface-hover border border-accent text-primary"
              : "text-secondary hover:text-primary hover:bg-surface-hover",
 ].join(" ")
 }
 title={isCollapsed ? item.label : undefined}
 >
 <span className="text-base flex-shrink-0 leading-none flex items-center justify-center w-5">{item.icon}</span>
 {!isCollapsed && <span className="leading-normal">{item.label}</span>}
 </NavLink>
 ))}
 </nav>
 </aside>
 );
}


