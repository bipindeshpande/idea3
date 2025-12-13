import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

// Marketing navigation (logged-out only)
const marketingNavLinks = [
  { label: "Product", to: "/product" },
  { label: "Pricing", to: "/pricing" },
];

const learnNavLinks = [
  { label: "Resources", to: "/resources" },
  { label: "Blog", to: "/blog" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navigation() {
  const { reports, inputs } = useReports();
  const { user, isAuthenticated, subscription, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [learnMenuOpen, setLearnMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const learnMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    closeAllMenus();
    window.location.href = "/";
  };

  // Link styles for logged-out (marketing) navigation
  const marketingLinkClass = ({ isActive }) =>
    `px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-300 ${
      isActive ? "text-brand-700 dark:text-brand-400" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
    }`;

  // Link styles for logged-in (app) navigation
  const appLinkClass = ({ isActive }) =>
    `px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-300 ${
      isActive ? "text-brand-700 dark:text-brand-400" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `px-4 py-2 text-left text-sm font-medium whitespace-nowrap ${
      isActive ? "text-brand-700 dark:text-brand-400" : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
    }`;

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setLearnMenuOpen(false);
    setUserMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
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
  }, [learnMenuOpen, userMenuOpen]);

  return (
    <header className="z-40 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        {/* Logo */}
        <NavLink
          to={isAuthenticated ? "/dashboard" : "/"}
          className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-600 to-brand-700 dark:from-brand-400 dark:to-brand-500 bg-clip-text text-transparent whitespace-nowrap transition-opacity hover:opacity-80"
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
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => {
                      setUserMenuOpen((prev) => !prev);
                      setLearnMenuOpen(false);
                    }}
                    aria-expanded={userMenuOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="hidden xl:block max-w-[120px] truncate">{user?.email}</span>
                    <span className="text-xs">▾</span>
                  </button>
                  <div
                    className={`absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-lg transition-all duration-200 ${
                      userMenuOpen ? "pointer-events-auto opacity-100 visible" : "pointer-events-none opacity-0 invisible"
                    }`}
                  >
                    <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 mb-1">
                      {user?.email}
                    </div>
                    <div className="mb-1">
                      <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        Profile & Preferences
                      </div>
                      <NavLink
                        to="/founder-psychology"
                        className={({ isActive }) =>
                          `block rounded-lg px-3 py-2 text-sm transition ${
                            isActive
                              ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
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
                              ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`
                        }
                        onClick={closeAllMenus}
                      >
                        Decision & Work Style
                      </NavLink>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                    <div className="mb-1">
                      <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        Help
                      </div>
                      <button
                        onClick={() => {
                          closeAllMenus();
                          navigate("/dashboard?show=getting-started");
                        }}
                        className="block w-full text-left rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      >
                        How this works
                      </button>
                      <Link
                        to="/advisor-resources"
                        className="block rounded-lg px-3 py-2 text-sm transition text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        onClick={closeAllMenus}
                      >
                        Resources
                      </Link>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                    <div className="mb-1">
                      <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        System
                      </div>
                      <NavLink
                        to="/account"
                        className={({ isActive }) =>
                          `block rounded-lg px-3 py-2 text-sm transition ${
                            isActive
                              ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`
                        }
                        onClick={closeAllMenus}
                      >
                        Account Settings
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="rounded-lg border border-slate-300 dark:border-slate-600 px-2.5 py-2 text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
                  aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                  title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {theme === "light" ? (
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          ) : (
            // Logged-Out Navigation (Marketing Mode)
            <>
              <nav className="flex items-center gap-6">
                {marketingNavLinks.map(({ label, to }) => (
                  <NavLink key={to} to={to} className={marketingLinkClass} onClick={closeAllMenus}>
                    {label}
                  </NavLink>
                ))}
                <div className="group relative" ref={learnMenuRef}>
                  <button
                    type="button"
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:text-slate-900 dark:hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-300"
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
                    className={`absolute left-0 z-40 mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-lg transition-all duration-200 ${
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
                              ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
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
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeAllMenus}
                  className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-200 hover:from-brand-600 hover:to-brand-700 hover:shadow-xl hover:shadow-brand-500/30 whitespace-nowrap"
                >
                  Get Started
                </Link>
                <button
                  onClick={toggleTheme}
                  className="rounded-lg border border-slate-300 dark:border-slate-600 px-2.5 py-2 text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
                  aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                  title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {theme === "light" ? (
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300"
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
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 lg:hidden">
          <nav className="p-4 space-y-1">
            {isAuthenticated ? (
              // Logged-In Mobile Menu
              <>
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    Profile & Preferences
                  </div>
                  <NavLink to="/founder-psychology" className={mobileLinkClass} onClick={closeAllMenus}>
                    Founder Profile
                  </NavLink>
                  <NavLink to="/psyche/questionnaire" className={mobileLinkClass} onClick={closeAllMenus}>
                    Decision & Work Style
                  </NavLink>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    Help
                  </div>
                  <button
                    onClick={() => {
                      closeAllMenus();
                      navigate("/dashboard?show=getting-started");
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    How this works
                  </button>
                  <Link
                    to="/advisor-resources"
                    className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                    onClick={closeAllMenus}
                  >
                    Resources
                  </Link>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    System
                  </div>
                  <NavLink to="/account" className={mobileLinkClass} onClick={closeAllMenus}>
                    Account Settings
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    Logout
                  </button>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                  aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {theme === "light" ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Light Mode</span>
                    </>
                  )}
                </button>
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
                  <p className="px-4 py-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-400">Learn</p>
                  {learnNavLinks.map(({ label, to }) => (
                    <NavLink key={to} to={to} className={mobileLinkClass} onClick={closeAllMenus}>
                      {label}
                    </NavLink>
                  ))}
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                <Link
                  to="/login"
                  onClick={closeAllMenus}
                  className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeAllMenus}
                  className="block rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-md transition hover:from-brand-600 hover:to-brand-700"
                >
                  Get Started
                </Link>
                <button
                  onClick={toggleTheme}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                  aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {theme === "light" ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Light Mode</span>
                    </>
                  )}
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

