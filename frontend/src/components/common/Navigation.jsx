/**
 * Navigation - Marketing Site Navigation
 * 
 * Rules:
 * - Mobile-first
 * - Click-based dropdowns (not hover)
 * - No hover traps
 * - Predictable behavior
 * - Uses marketing tokens only
 */

import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import UserMenu from "./UserMenu.jsx";

const productLinks = [
  { label: "Overview", to: "/product" },
  { label: "Discover Ideas", to: "/product/discover" },
  { label: "Validate Ideas", to: "/product/validate" },
  { label: "Founder Network", to: "/product/network" },
];

const resourceLinks = [
  { label: "Templates", to: "/resources/templates" },
  { label: "Blog", to: "/blog" },
];

const learnLinks = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navigation() {
  const { isAuthenticated, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);

  const closeAll = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeAll();
    window.location.href = "/";
  };

  // Click outside handler
  useEffect(() => {
    const handler = (e) => {
      // Check if click is inside navigation or any dropdown
      if (navRef.current?.contains(e.target)) {
        // Check if click is on a NavLink inside dropdown
        const clickedLink = e.target.closest('a[href]');
        if (clickedLink && clickedLink.getAttribute('href')?.startsWith('/')) {
          // Allow navigation, but close dropdown after a small delay
          setTimeout(() => closeAll(), 100);
          return;
        }
        return;
      }
      closeAll();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Dropdown component - Click-based (not hover)
  const Dropdown = ({ name, label, links }) => {
    const isOpen = openMenu === name;
    const dropdownRef = useRef(null);
    
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu(isOpen ? null : name);
            setMobileOpen(false);
          }}
          className="flex items-center gap-1 px-4 py-2 text-base font-medium transition-colors"
          style={{
            fontFamily: "var(--font-family)",
            color: isOpen ? "var(--mkt-primary)" : "var(--mkt-heading)",
          }}
        >
          {label} <span style={{ fontSize: "var(--font-size-xs)" }}>▾</span>
        </button>

        {isOpen && (
          <div
            className="absolute left-0 top-full mt-2 w-56 z-50"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div
              className="rounded-lg border p-2"
              style={{
                backgroundColor: "var(--mkt-surface)",
                borderColor: "var(--mkt-outline)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              {links.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAll();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm transition-colors cursor-pointer ${
                      isActive ? "font-semibold" : ""
                    }`
                  }
                  style={({ isActive }) => ({
                    fontFamily: "var(--font-family)",
                    color: isActive ? "var(--mkt-primary)" : "var(--mkt-heading)",
                    backgroundColor: isActive ? "var(--mkt-surface-muted)" : "transparent",
                  })}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header
      ref={navRef}
      className="w-full"
      style={{
        backgroundColor: "var(--mkt-surface)",
        borderBottom: "1px solid var(--mkt-outline)",
      }}
    >
      <div className="container flex items-center justify-between gap-4 py-3">
        {/* Logo */}
        <NavLink
          to={isAuthenticated ? "/dashboard" : "/"}
          onClick={closeAll}
          className="text-xl font-bold"
          style={{
            fontFamily: "var(--font-family)",
            color: "var(--mkt-heading)",
          }}
        >
          Idea Bunch
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 flex-1">
          {!isAuthenticated ? (
            <>
              <Dropdown name="product" label="Product" links={productLinks} />
              <Dropdown name="resources" label="Resources" links={resourceLinks} />
              <Dropdown name="learn" label="Learn" links={learnLinks} />
              <Link
                to="/pricing"
                onClick={closeAll}
                className="flex items-center gap-1 px-4 py-2 text-base font-medium transition-colors"
                style={{
                  fontFamily: "var(--font-family)",
                  color: "var(--mkt-heading)",
                }}
              >
                Pricing
              </Link>
            </>
          ) : (
            <>
              <div className="flex-1" />
              <UserMenu />
            </>
          )}
        </nav>

        {/* Right Side - Desktop */}
        {!isAuthenticated && (
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-base font-medium transition-colors"
              style={{
                fontFamily: "var(--font-family)",
                color: "var(--mkt-heading)",
              }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-base font-semibold rounded-lg transition-colors"
              style={{
                fontFamily: "var(--font-family)",
                backgroundColor: "var(--mkt-primary)",
                color: "white",
              }}
            >
              Get Started
            </Link>
            <ThemeToggle />
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 rounded-md border transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setMobileOpen(!mobileOpen);
            setOpenMenu(null);
          }}
          style={{
            borderColor: "var(--mkt-outline)",
          }}
          aria-label="Toggle menu"
        >
          <span className="text-xl">{mobileOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t p-4 space-y-2"
          style={{
            borderTopColor: "var(--mkt-outline)",
            backgroundColor: "var(--mkt-surface)",
          }}
        >
          {!isAuthenticated ? (
            <>
              <div className="pt-2">
                <p className="text-xs font-semibold mb-2 uppercase" style={{ color: "var(--mkt-text-dim)" }}>
                  Product
                </p>
                {productLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeAll}
                    className="block py-2 text-sm"
                    style={{
                      fontFamily: "var(--font-family)",
                      color: "var(--mkt-heading)",
                    }}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold mb-2 uppercase" style={{ color: "var(--mkt-text-dim)" }}>
                  Resources
                </p>
                {resourceLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeAll}
                    className="block py-2 text-sm"
                    style={{
                      fontFamily: "var(--font-family)",
                      color: "var(--mkt-heading)",
                    }}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold mb-2 uppercase" style={{ color: "var(--mkt-text-dim)" }}>
                  Learn
                </p>
                {learnLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeAll}
                    className="block py-2 text-sm"
                    style={{
                      fontFamily: "var(--font-family)",
                      color: "var(--mkt-heading)",
                    }}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              <Link
                to="/pricing"
                onClick={closeAll}
                className="block py-2 text-base font-medium"
                style={{
                  fontFamily: "var(--font-family)",
                  color: "var(--mkt-heading)",
                }}
              >
                Pricing
              </Link>

              <div className="pt-4 space-y-2">
                <Link
                  to="/login"
                  onClick={closeAll}
                  className="block py-2 text-base font-medium text-center"
                  style={{
                    fontFamily: "var(--font-family)",
                    color: "var(--mkt-heading)",
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeAll}
                  className="block py-2 text-base font-semibold text-center rounded-lg"
                  style={{
                    fontFamily: "var(--font-family)",
                    backgroundColor: "var(--mkt-primary)",
                    color: "white",
                  }}
                >
                  Get Started
                </Link>
                <div className="flex justify-center pt-2">
                  <ThemeToggle />
                </div>
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/founder-psychology"
                onClick={closeAll}
                className="block py-2 text-sm"
                style={{
                  fontFamily: "var(--font-family)",
                  color: "var(--mkt-heading)",
                }}
              >
                Founder Profile
              </NavLink>
              <NavLink
                to="/psyche/questionnaire"
                onClick={closeAll}
                className="block py-2 text-sm"
                style={{
                  fontFamily: "var(--font-family)",
                  color: "var(--mkt-heading)",
                }}
              >
                Decision & Work Style
              </NavLink>
              <button
                onClick={handleLogout}
                className="block py-2 text-sm text-left"
                style={{
                  fontFamily: "var(--font-family)",
                  color: "var(--mkt-heading)",
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
