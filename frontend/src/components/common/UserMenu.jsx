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
 className="flex items-center gap-2 px-3 py-2 text-base font-medium text-primary transition hover:text-accent-hover focus-visible:outline-accent rounded-lg hover:bg-surface-hover"
 onClick={() => setOpen(!open)}
 aria-expanded={open}
 >
 <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent text-on-accent text-xs font-semibold">
 {initial}
 </div>
 <span className="hidden xl:block max-w-[120px] truncate">{user?.email}</span>
 <span className="text-xs">▾</span>
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
 <button
 onClick={() => {
 closeMenu();
 navigate("/dashboard?show=getting-started");
 }}
 className="block w-full text-left rounded-lg px-3 py-2 text-base text-primary hover:bg-surface-hover transition"
 >
 How this works
 </button>
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
 <NavLink
 to="/account"
 className={({ isActive }) =>
 `block rounded-lg px-3 py-2 text-base transition ${
 isActive
 ? "bg-surface-hover text-accent"
 : "text-primary hover:bg-surface-hover"
 }`
 }
 onClick={closeMenu}
 >
 Account Settings
 </NavLink>
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

