import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function UserMenu() {
 const { user, logout } = useAuth();
 const navigate = useNavigate();
 const [open, setOpen] = useState(false);
 const menuRef = useRef(null);

 const initial = (user?.email?.trim()?.[0] || "U").toUpperCase();

 const handleLogout = async () => {
 await logout();
 setOpen(false);
 window.location.href = "/";
 };

 const closeMenu = () => setOpen(false);

 // Close menu when clicking outside
 useEffect(() => {
 const handleClickOutside = (event) => {
 if (menuRef.current && !menuRef.current.contains(event.target)) {
 setOpen(false);
 }
 };

 if (open) {
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }
 }, [open]);

 return (
 <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-default hover:bg-surface-hover transition-colors focus-visible:outline-accent relative"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-accent text-on-accent text-xs font-semibold">
          {initial}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 text-[8px] leading-none text-primary">▾</span>
      </button>

 {open && (
 <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-default bg-surface p-2 shadow-card-lg transition-all duration-200">
 <div className="px-3 py-2 text-xs text-secondary border-b border-default mb-1">
 {user?.email}
 </div>
 <div className="mb-1">
 <div className="px-3 py-1.5 text-xs font-semibold text-secondary uppercase tracking-wide">
 Profile & Preferences
 </div>
 <NavLink
 to="/founder-psychology"
 className={({ isActive }) =>
 `block rounded-lg px-3 py-2 text-base transition ${
 isActive
 ? "bg-surface-hover text-accent"
 : "text-primary hover:bg-surface-hover"
 }`
 }
 onClick={closeMenu}
 >
 Founder Profile
 </NavLink>
 <NavLink
 to="/psyche/questionnaire"
 className={({ isActive }) =>
 `block rounded-lg px-3 py-2 text-base transition ${
 isActive
 ? "bg-surface-hover text-accent"
 : "text-primary hover:bg-surface-hover"
 }`
 }
 onClick={closeMenu}
 >
 Decision & Work Style
 </NavLink>
 </div>
 <div className="border-t border-default my-1"></div>
 <div className="mb-1">
 <div className="px-3 py-1.5 text-xs font-semibold text-secondary uppercase tracking-wide">
 Help
 </div>
 <NavLink
 to="/how-advisor-thinks"
 className="block rounded-lg px-3 py-2 text-base transition text-primary hover:bg-surface-hover"
 onClick={closeMenu}
 >
 How Advisor Thinks
 </NavLink>
 <NavLink
 to="/advisor-resources"
 className="block rounded-lg px-3 py-2 text-base transition text-primary hover:bg-surface-hover"
 onClick={closeMenu}
 >
 Resources
 </NavLink>
 </div>
 <div className="border-t border-default my-1"></div>
 <div className="mb-1">
 <div className="px-3 py-1.5 text-xs font-semibold text-secondary uppercase tracking-wide">
 System
 </div>
 <button
 onClick={handleLogout}
 className="block w-full text-left rounded-lg px-3 py-2 text-base text-primary hover:bg-surface-hover transition"
 >
 Logout
 </button>
 </div>
 </div>
 )}
 </div>
 );
}

