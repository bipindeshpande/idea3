import { NavLink } from "react-router-dom";

const nav = [
 { to: "/dashboard", label: "My Workspace" },
 { to: "/validate-idea", label: "Validate Your Idea" },
 { to: "/advisor", label: "Discover New Ideas" },
 { to: "/dashboard/frameworks", label: "My Validation Frameworks" },
 { to: "/resources/templates", label: "Browse Templates & Resources" },
 { to: "/dashboard/runs", label: "View Run History" },
 { to: "/founder-connect", label: "Founder Network" },
 { to: "/account", label: "Account Settings" },
];

export default function Sidebar() {
 return (
 <aside className="h-full w-full">
 <div className="px-5 pt-7 pb-5">
 <div className="text-base font-bold tracking-tight text-primary">
 IDEA
 </div>
 <div className="mt-1 text-xs text-secondary">Workspace</div>
 </div>
 <nav className="px-3 pb-6">
 {nav.map((item) => (
 <NavLink
 key={item.to}
 to={item.to}
 className={({ isActive }) =>
 [
 "block ui-radius-btn px-3 py-2.5 text-sm font-medium transition leading-tight",
            isActive
              ? "bg-surface-hover border border-accent text-primary"
              : "text-secondary hover:text-primary hover:bg-surface-hover",
 ].join(" ")
 }
 >
 {item.label}
 </NavLink>
 ))}
 </nav>
 </aside>
 );
}


