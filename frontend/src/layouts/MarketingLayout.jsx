/**
 * MarketingLayout - Grid-based, consistent layout
 * 
 * Rules:
 * - Footer always present
 * - Grid-based layout
 * - Symmetrical alignment
 * - Uses tokens only
 * - Lightweight scroll reveal only
 */

import { useEffect, useState } from "react";
import Navigation from "../components/common/Navigation.jsx";
import Footer from "../components/common/Footer.jsx";

export default function MarketingLayout({ children, fullWidth = false }) {
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for navigation styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lightweight scroll reveal (opacity + transform only)
  useEffect(() => {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
      // Set initial state
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, [children]);

  return (
    <div 
      className="min-h-screen marketing-layout"
      style={{
        fontFamily: "var(--font-family)",
        backgroundColor: "var(--mkt-surface)",
        color: "var(--mkt-heading)",
      }}
    >
      {/* Navigation - Sticky, uses tokens */}
      <nav
        className="sticky top-0 z-50 transition-all duration-200"
        style={{
          backgroundColor: isScrolled ? "var(--mkt-surface)" : "transparent",
          backdropFilter: isScrolled ? "blur(8px)" : "none",
          boxShadow: isScrolled ? "var(--mkt-card-shadow)" : "none",
          borderBottom: isScrolled ? "1px solid var(--mkt-outline)" : "none",
        }}
      >
        <Navigation />
      </nav>
      
      {/* Main Content - Grid-based, consistent */}
      <main 
        className={fullWidth ? "w-full" : "container"}
        style={{
          minHeight: "calc(100vh - 200px)", // Account for nav + footer
        }}
      >
        {children}
      </main>
      
      {/* Footer - Always present */}
      <Footer />
    </div>
  );
}
