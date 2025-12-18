import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

// Marketing navigation (logged-out only)
const productNavLinks = [
 { label: "Overview", to: "/product" },
 { label: "Discover Ideas", to: "/product/discover" },
 { label: "Validate Ideas", to: "/product/validate" },
 { label: "Founder Network", to: "/product/network" },
];

const resourcesNavLinks = [
 { label: "Templates", to: "/resources/templates" },
 { label: "Resources", to: "/resources" },
 { label: "Blog", to: "/blog" },
];

const learnNavLinks = [
 { label: "About", to: "/about" },
 { label: "Contact", to: "/contact" },
];

export default function Navigation() {
 const { reports, inputs } = useReports();
 const { user, isAuthenticated, subscription, logout } = useAuth();
 const navigate = useNavigate();
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [productMenuOpen, setProductMenuOpen] = useState(false);
 const [resourcesMenuOpen, setResourcesMenuOpen] = useState(false);
 const [learnMenuOpen, setLearnMenuOpen] = useState(false);
 const [userMenuOpen, setUserMenuOpen] = useState(false);
 const productMenuRef = useRef(null);
 const resourcesMenuRef = useRef(null);
 const learnMenuRef = useRef(null);
 const userMenuRef = useRef(null);

 const handleLogout = async () => {
 await logout();
 closeAllMenus();
 window.location.href = "/";
 };

 // Link styles for logged-out (marketing) navigation
 const marketingLinkClass = ({ isActive }) =>
 `px-4 py-2 text-sm font-medium transition focus-visible:outline-accent ${
 isActive ? "text-accent" : "text-secondary hover:text-accent-hover"
 }`;

 // Link styles for logged-in (app) navigation
 const appLinkClass = ({ isActive }) =>
 `px-4 py-2 text-sm font-medium transition focus-visible:outline-accent ${
 isActive ? "text-accent" : "text-secondary hover:text-accent-hover"
 }`;

 const mobileLinkClass = ({ isActive }) =>
 `px-4 py-2 text-left text-sm font-medium whitespace-nowrap ${
 isActive ? "text-accent text-accent" : "text-primary text-secondary hover:text-primary hover:text-primary"
 }`;

 const closeAllMenus = () => {
 setMobileMenuOpen(false);
 setProductMenuOpen(false);
 setResourcesMenuOpen(false);
 setLearnMenuOpen(false);
 setUserMenuOpen(false);
 };

 useEffect(() => {
 const handleClickOutside = (event) => {
 if (
 productMenuRef.current &&
 !productMenuRef.current.contains(event.target) &&
 productMenuOpen
 ) {
 setProductMenuOpen(false);
 }
 if (
 resourcesMenuRef.current &&
 !resourcesMenuRef.current.contains(event.target) &&
 resourcesMenuOpen
 ) {
 setResourcesMenuOpen(false);
 }
 if (
 learnMenuRef.current &&
 !learnMenuRef.current.contains(event.target) &&
 learnMenuOpen
 ) {
 setLearnMenuOpen(false);
 }
 if (
 userMenuRef.current &&
 !userMenuRef.current.contains(event.target) &&
 userMenuOpen
 ) {
 setUserMenuOpen(false);
 }
 };

 const handleEscape = (event) => {
 if (event.key === "Escape") {
 closeAllMenus();
 }
 };

 document.addEventListener("mousedown", handleClickOutside);
 document.addEventListener("keyup", handleEscape);
 return () => {
 document.removeEventListener("mousedown", handleClickOutside);
 document.removeEventListener("keyup", handleEscape);
 };
 }, [productMenuOpen, resourcesMenuOpen, learnMenuOpen, userMenuOpen]);

 return (
 <header className="z-40 border-b border-default bg-surface">
 <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
 {/* Logo */}
 <NavLink
 to={isAuthenticated ? "/dashboard" : "/"}
 className="text-xl font-bold tracking-tight text-primary whitespace-nowrap transition-opacity hover:opacity-80"
 onClick={closeAllMenus}
 title={isAuthenticated ? "Back to Dashboard" : ""}
 >
 Startup Idea Advisor
 </NavLink>

 {/* Desktop Navigation */}
 <div className="hidden lg:flex items-center gap-6 flex-1">
 {isAuthenticated ? (
 // Logged-In Navigation (App Mode)
 <>
 <div className="flex-1"></div>
 <div className="flex items-center gap-3">
 {/* User Dropdown */}
 <div className="relative" ref={userMenuRef}>
 <button
 type="button"
 className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary transition hover:text-accent-hover focus-visible:outline-accent rounded-lg hover:bg-surface-hover"
 onClick={() => {
 setUserMenuOpen((prev) => !prev);
 setLearnMenuOpen(false);
 }}
 aria-expanded={userMenuOpen}
 >
 <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent text-on-accent text-xs font-semibold">
 {user?.email?.charAt(0).toUpperCase() || "U"}
 </div>
 <span className="hidden xl:block max-w-[120px] truncate">{user?.email}</span>
 <span className="text-xs">▾</span>
 </button>
 <div
 className={`absolute right-0 z-50 mt-2 w-56 rounded-xl border border-default bg-surface p-2 shadow-lg transition-all duration-200 ${
 userMenuOpen ? "pointer-events-auto opacity-100 visible" : "pointer-events-none opacity-0 invisible"
 }`}
 >
 <div className="px-3 py-2 text-xs text-secondary text-secondary border-b border-default mb-1">
 {user?.email}
 </div>
 <div className="mb-1">
 <div className="px-3 py-1.5 text-xs font-semibold text-secondary text-secondary uppercase tracking-wide">
 Profile & Preferences
 </div>
 <NavLink
 to="/founder-psychology"
 className={({ isActive }) =>
 `block rounded-lg px-3 py-2 text-sm transition ${
 isActive
 ? "bg-surface bg-surface text-accent text-accent"
 : "text-primary text-secondary hover:bg-surface hover:bg-surface"
 }`
 }
 onClick={closeAllMenus}
 >
 Founder Profile
 </NavLink>
 <NavLink
 to="/psyche/questionnaire"
 className={({ isActive }) =>
 `block rounded-lg px-3 py-2 text-sm transition ${
 isActive
 ? "bg-surface bg-surface text-accent text-accent"
 : "text-primary text-secondary hover:bg-surface hover:bg-surface"
 }`
 }
 onClick={closeAllMenus}
 >
 Decision & Work Style
 </NavLink>
 </div>
 <div className="border-t border-default my-1"></div>
 <div className="mb-1">
 <div className="px-3 py-1.5 text-xs font-semibold text-secondary text-secondary uppercase tracking-wide">
 Help
 </div>
 <button
 onClick={() => {
 closeAllMenus();
 navigate("/dashboard?show=getting-started");
 }}
 className="block w-full text-left rounded-lg px-3 py-2 text-sm text-primary text-secondary hover:bg-surface hover:bg-surface transition"
 >
 How this works
 </button>
 <Link
 to="/advisor-resources"
 className="block rounded-lg px-3 py-2 text-sm transition text-primary text-secondary hover:bg-surface hover:bg-surface"
 onClick={closeAllMenus}
 >
 Resources
 </Link>
 </div>
 <div className="border-t border-default my-1"></div>
 <div className="mb-1">
 <div className="px-3 py-1.5 text-xs font-semibold text-secondary text-secondary uppercase tracking-wide">
 System
 </div>
 <NavLink
 to="/account"
 className={({ isActive }) =>
 `block rounded-lg px-3 py-2 text-sm transition ${
 isActive
 ? "bg-surface bg-surface text-accent text-accent"
 : "text-primary text-secondary hover:bg-surface hover:bg-surface"
 }`
 }
 onClick={closeAllMenus}
 >
 Account Settings
 </NavLink>
 <button
 onClick={handleLogout}
 className="block w-full text-left rounded-lg px-3 py-2 text-sm text-primary text-secondary hover:bg-surface hover:bg-surface transition"
 >
 Logout
 </button>
 </div>
 </div>
 </div>
 <ThemeToggle />
 </div>
 </>
 ) : (
 // Logged-Out Navigation (Marketing Mode)
 <>
 <nav className="flex items-center gap-6">
 <Link to="/pricing" className={marketingLinkClass({ isActive: false })} onClick={closeAllMenus}>
 Pricing
 </Link>
 <div className="group relative" ref={productMenuRef}>
 <button
 type="button"
 className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-secondary transition hover:text-accent-hover focus-visible:outline-accent"
 onClick={() => {
 setProductMenuOpen((prev) => !prev);
 setResourcesMenuOpen(false);
 setLearnMenuOpen(false);
 }}
 onMouseEnter={() => setProductMenuOpen(true)}
 aria-expanded={productMenuOpen}
 >
 Product
 <span className="text-xs">▾</span>
 </button>
 <div
 className={`absolute left-0 z-40 mt-2 w-56 rounded-xl border border-default bg-surface p-2 shadow-lg transition-all duration-200 ${
 productMenuOpen ? "pointer-events-auto opacity-100 visible" : "pointer-events-none opacity-0 invisible"
 } group-hover:pointer-events-auto group-hover:opacity-100 group-hover:visible`}
 onMouseEnter={() => setProductMenuOpen(true)}
 onMouseLeave={() => setProductMenuOpen(false)}
 >
 {productNavLinks.map(({ label, to }) => (
 <NavLink
 key={to}
 to={to}
 className={({ isActive }) =>
 `block rounded-lg px-3 py-2 text-sm transition ${
 isActive
 ? "bg-surface bg-surface text-accent text-accent"
 : "text-primary text-secondary hover:bg-surface hover:bg-surface"
 }`
 }
 onClick={closeAllMenus}
 >
 {label}
 </NavLink>
 ))}
 </div>
 </div>
 <div className="group relative" ref={resourcesMenuRef}>
 <button
 type="button"
 className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-secondary transition hover:text-accent-hover focus-visible:outline-accent"
 onClick={() => {
 setResourcesMenuOpen((prev) => !prev);
 setProductMenuOpen(false);
 setLearnMenuOpen(false);
 }}
 onMouseEnter={() => setResourcesMenuOpen(true)}
 aria-expanded={resourcesMenuOpen}
 >
 Resources
 <span className="text-xs">▾</span>
 </button>
 <div
 className={`absolute left-0 z-40 mt-2 w-56 rounded-xl border border-default bg-surface p-2 shadow-lg transition-all duration-200 ${
 resourcesMenuOpen ? "pointer-events-auto opacity-100 visible" : "pointer-events-none opacity-0 invisible"
 } group-hover:pointer-events-auto group-hover:opacity-100 group-hover:visible`}
 onMouseEnter={() => setResourcesMenuOpen(true)}
 onMouseLeave={() => setResourcesMenuOpen(false)}
 >
 {resourcesNavLinks.map(({ label, to }) => (
 <NavLink
 key={to}
 to={to}
 className={({ isActive }) =>
 `block rounded-lg px-3 py-2 text-sm transition ${
 isActive
 ? "bg-surface bg-surface text-accent text-accent"
 : "text-primary text-secondary hover:bg-surface hover:bg-surface"
 }`
 }
 onClick={closeAllMenus}
 >
 {label}
 </NavLink>
 ))}
 </div>
 </div>
 <div className="group relative" ref={learnMenuRef}>
 <button
 type="button"
 className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-secondary transition hover:text-accent-hover focus-visible:outline-accent"
 onClick={() => {
 setLearnMenuOpen((prev) => !prev);
 }}
 onMouseEnter={() => setLearnMenuOpen(true)}
 aria-expanded={learnMenuOpen}
 >
 Learn
 <span className="text-xs">▾</span>
 </button>
 <div
 className={`absolute left-0 z-40 mt-2 w-48 rounded-xl border border-default bg-surface p-2 shadow-lg transition-all duration-200 ${
 learnMenuOpen ? "pointer-events-auto opacity-100 visible" : "pointer-events-none opacity-0 invisible"
 } group-hover:pointer-events-auto group-hover:opacity-100 group-hover:visible`}
 onMouseEnter={() => setLearnMenuOpen(true)}
 onMouseLeave={() => setLearnMenuOpen(false)}
 >
 {learnNavLinks.map(({ label, to }) => (
 <NavLink
 key={to}
 to={to}
 className={({ isActive }) =>
 `block rounded-lg px-3 py-2 text-sm transition ${
 isActive
 ? "bg-surface bg-surface text-accent text-accent"
 : "text-primary text-secondary hover:bg-surface hover:bg-surface"
 }`
 }
 onClick={closeAllMenus}
 >
 {label}
 </NavLink>
 ))}
 </div>
 </div>
 </nav>
 <div className="ml-auto flex items-center gap-3">
 <Link
 to="/login"
 onClick={closeAllMenus}
 className="px-4 py-2 text-sm font-medium text-primary text-secondary hover:text-primary hover:text-primary transition"
 >
 Sign In
 </Link>
 <Link
 to="/register"
 onClick={closeAllMenus}
 className="ui-btn ui-btn-primary whitespace-nowrap focus-visible:outline-accent"
 >
 Get Started
 </Link>
 <ThemeToggle />
 </div>
 </>
 )}
 </div>

 {/* Mobile Navigation */}
 <div className="lg:hidden flex items-center gap-3">
 <button
 type="button"
 className="rounded-lg border border-default px-3 py-2 text-sm font-medium text-primary text-secondary"
 onClick={() => {
 const next = !mobileMenuOpen;
 setMobileMenuOpen(next);
 if (!next) {
 setLearnMenuOpen(false);
 setUserMenuOpen(false);
 }
 }}
 aria-expanded={mobileMenuOpen}
 aria-label="Toggle navigation menu"
 >
 ☰
 </button>
 </div>
 </div>
 {/* Mobile Menu */}
 {mobileMenuOpen && (
 <div className="border-t border-default bg-surface lg:hidden">
 <nav className="p-4 space-y-1">
 {isAuthenticated ? (
 // Logged-In Mobile Menu
 <>
 <div className="mb-2">
 <div className="px-4 py-2 text-xs font-semibold text-secondary text-secondary uppercase tracking-wide">
 Profile & Preferences
 </div>
 <NavLink to="/founder-psychology" className={mobileLinkClass} onClick={closeAllMenus}>
 Founder Profile
 </NavLink>
 <NavLink to="/psyche/questionnaire" className={mobileLinkClass} onClick={closeAllMenus}>
 Decision & Work Style
 </NavLink>
 </div>
 <div className="border-t border-default my-2"></div>
 <div className="mb-2">
 <div className="px-4 py-2 text-xs font-semibold text-secondary text-secondary uppercase tracking-wide">
 Help
 </div>
 <button
 onClick={() => {
 closeAllMenus();
 navigate("/dashboard?show=getting-started");
 }}
 className="block w-full text-left px-4 py-2 text-sm font-medium text-primary text-secondary hover:text-primary hover:text-primary"
 >
 How this works
 </button>
 <Link
 to="/advisor-resources"
 className="block px-4 py-2 text-sm font-medium text-primary text-secondary hover:text-primary hover:text-primary"
 onClick={closeAllMenus}
 >
 Resources
 </Link>
 </div>
 <div className="border-t border-default my-2"></div>
 <div className="mb-2">
 <div className="px-4 py-2 text-xs font-semibold text-secondary text-secondary uppercase tracking-wide">
 System
 </div>
 <NavLink to="/account" className={mobileLinkClass} onClick={closeAllMenus}>
 Account Settings
 </NavLink>
 <button
 onClick={handleLogout}
 className="block w-full text-left px-4 py-2 text-sm font-medium text-primary text-secondary hover:text-primary hover:text-primary"
 >
 Logout
 </button>
 </div>
 <ThemeToggle variant="button" />
 </>
 ) : (
 // Logged-Out Mobile Menu
 <>
 {marketingNavLinks.map(({ label, to }) => (
 <NavLink key={to} to={to} className={mobileLinkClass} onClick={closeAllMenus}>
 {label}
 </NavLink>
 ))}
 <div className="space-y-1">
 <p className="px-4 py-2 text-xs uppercase tracking-wide text-secondary text-secondary">Learn</p>
 {learnNavLinks.map(({ label, to }) => (
 <NavLink key={to} to={to} className={mobileLinkClass} onClick={closeAllMenus}>
 {label}
 </NavLink>
 ))}
 </div>
 <div className="border-t border-default my-2"></div>
 <Link
 to="/login"
 onClick={closeAllMenus}
 className="block px-4 py-2 text-sm font-medium text-primary text-secondary hover:text-primary hover:text-primary"
 >
 Sign In
 </Link>
 <Link
 to="/register"
 onClick={closeAllMenus}
 className="ui-btn ui-btn-primary block w-full text-center focus-visible:outline-accent"
 >
 Get Started
 </Link>
 <ThemeToggle variant="button" />
 </>
 )}
 </nav>
 </div>
 )}
 </header>
 );
}

