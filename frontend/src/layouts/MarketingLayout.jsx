import { useEffect, useState } from "react";
import Navigation from "../components/common/Navigation.jsx";
import Footer from "../components/common/Footer.jsx";

export default function MarketingLayout({ children, fullWidth = false }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll reveal observer (V4) - ONLY for MarketingLayout
  useEffect(() => {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, [children]);

  return (
    <div className="app-shell bg-app text-primary font-sans">
      {/* Navigation with scroll-based styling */}
      <div
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-surface backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <Navigation />
      </div>
      
      <main className={fullWidth ? "w-full" : "page-wrap"}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
