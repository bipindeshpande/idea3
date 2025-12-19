// Navigation.jsx — Ultra Clean Rewrite 

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
  { label: "Resources", to: "/resources" },
  { label: "Blog", to: "/blog" },
];

const learnLinks = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navigation() {
  const { isAuthenticated, logout } = useAuth();

  const [openMenu, setOpenMenu] = useState(null); // "product" | "resources" | "learn" | null
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuRefs = {
    product: useRef(null),
    resources: useRef(null),
    learn: useRef(null),
  };

  const closeAll = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeAll();
    window.location.href = "/";
  };

  // CLICK OUTSIDE HANDLER - Fixed with mousedown and proper ref checking
  useEffect(() => {
    const handler = (e) => {
      // If click is inside ANY menu container (button or dropdown), ignore
      if (
        Object.values(menuRefs).some((ref) =>
          ref.current?.contains(e.target)
        )
      ) {
        return;
      }

      // Otherwise close everything
      closeAll();
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reusable Dropdown Component
  const Dropdown = ({ name, label, links }) => (
    <div 
      className="relative" 
      ref={menuRefs[name]}
      onMouseEnter={() => setOpenMenu(name)}
      onMouseLeave={() => setOpenMenu(null)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenu(openMenu === name ? null : name);
          setMobileOpen(false);
        }}
        className="flex items-center gap-1 px-4 py-2 ui-body font-medium text-secondary hover:text-accent-hover"
      >
        {label} <span className="text-xs">▾</span>
      </button>

      {openMenu === name && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setOpenMenu(name)}
          className="absolute left-0 top-full w-56 z-[999]"
        >
          <div className="pt-2">
            <div className="rounded-xl border border-default bg-surface p-2 shadow-lg">
              {links.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeAll}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 ui-small transition ${
                      isActive
                        ? "text-accent bg-surface"
                        : "text-primary hover:bg-surface-hover"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header className="z-[1000] border-b border-default bg-surface">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 px-6 py-3">

        {/* LOGO */}
        <NavLink
          to={isAuthenticated ? "/dashboard" : "/"}
          className="ui-h2 font-semibold"
          onClick={closeAll}
        >
          Startup Idea Advisor
        </NavLink>

        {/* DESKTOP NAV */}
        <div className="hidden lg:flex items-center gap-6 flex-1">

          {!isAuthenticated ? (
            <>
              {/* Marketing Menus */}
              <Link to="/pricing" className="ui-body" onClick={closeAll}>
                Pricing
              </Link>

              <Dropdown name="product" label="Product" links={productLinks} />
              <Dropdown name="resources" label="Resources" links={resourceLinks} />
              <Dropdown name="learn" label="Learn" links={learnLinks} />
            </>
          ) : (
            <>
              <div className="flex-1" />

              {/* USER MENU */}
              <UserMenu />
            </>
          )}
        </div>

        {/* RIGHT SIDE */}
        {!isAuthenticated && (
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className="ui-body">Sign In</Link>
            <Link to="/register" className="ui-btn ui-btn-primary">
              Get Started
            </Link>
            <ThemeToggle />
          </div>
        )}

        {/* MOBILE BURGER */}
        <button
          className="lg:hidden border border-default rounded-lg px-3 py-2"
          onClick={(e) => {
            e.stopPropagation();
            setMobileOpen(!mobileOpen);
            setOpenMenu(null);
          }}
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-default bg-surface p-4 space-y-1">
          {!isAuthenticated ? (
            <>
              <Link to="/pricing" onClick={closeAll} className="ui-body">Pricing</Link>

              <div>
                <p className="ui-xs mb-1">Product</p>
                {productLinks.map((l) => (
                  <NavLink key={l.to} to={l.to} onClick={closeAll} className="ui-small block">
                    {l.label}
                  </NavLink>
                ))}
              </div>

              <div>
                <p className="ui-xs mb-1">Resources</p>
                {resourceLinks.map((l) => (
                  <NavLink key={l.to} to={l.to} onClick={closeAll} className="ui-small block">
                    {l.label}
                  </NavLink>
                ))}
              </div>

              <div>
                <p className="ui-xs mb-1">Learn</p>
                {learnLinks.map((l) => (
                  <NavLink key={l.to} to={l.to} onClick={closeAll} className="ui-small block">
                    {l.label}
                  </NavLink>
                ))}
              </div>

              <Link to="/login" onClick={closeAll} className="ui-body">Sign In</Link>
              <Link to="/register" onClick={closeAll} className="ui-btn ui-btn-primary">Get Started</Link>

              <ThemeToggle variant="button" />
            </>
          ) : (
            <>
              <NavLink to="/founder-psychology" onClick={closeAll} className="ui-small block">Founder Profile</NavLink>
              <NavLink to="/psyche/questionnaire" onClick={closeAll} className="ui-small block">Decision & Work Style</NavLink>
              <button onClick={handleLogout} className="ui-small block text-left">Logout</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

