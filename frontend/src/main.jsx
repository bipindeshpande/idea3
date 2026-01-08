import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import { ReportsProvider } from "./context/ReportsContext.jsx";
import { ValidationProvider } from "./context/ValidationContext.jsx";
import { FrameworkProvider } from "./context/FrameworkContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./styles/theme.css";
import "./styles.css";
import "./styles/marketing.css";
import "./styles/marketing-tokens.css"; // Marketing design tokens - single source of truth
import "./styles/marketing-typography.css"; // Marketing typography system

// Initialize Sentry for error tracking (if DSN is provided)
// Note: We use dynamic import to avoid loading Sentry if DSN is not set
const initSentry = async () => {
  const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
  if (!SENTRY_DSN) return;
  
  try {
    const Sentry = await import("@sentry/react");
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: import.meta.env.MODE || "development",
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      // Filter out expected errors
      beforeSend(event, hint) {
        // Don't send 404 errors
        if (event.request?.url?.includes("404") || event.exception?.values?.[0]?.value?.includes("404")) {
          return null;
        }
        return event;
      },
    });
    // Make Sentry available globally for ErrorBoundary
    window.Sentry = Sentry;
  } catch (error) {
    console.warn("Failed to initialize Sentry:", error);
  }
};

// Initialize Sentry asynchronously (non-blocking)
initSentry();

const GA_ID = import.meta.env.VITE_GA_ID;

function Root() {
 useEffect(() => {
 if (!GA_ID) return;
 window.dataLayer = window.dataLayer || [];
 function gtag() {
 window.dataLayer.push(arguments);
 }
 gtag("js", new Date());
 gtag("config", GA_ID);

 const script = document.createElement("script");
 script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
 script.async = true;
 document.head.appendChild(script);
 }, []);

 return (
 <React.StrictMode>
 <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <ReportsProvider>
            <ValidationProvider>
              <FrameworkProvider>
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                  <App />
                </BrowserRouter>
              </FrameworkProvider>
            </ValidationProvider>
          </ReportsProvider>
        </AuthProvider>
      </ThemeProvider>
 </HelmetProvider>
 </React.StrictMode>
 );
}

const rootElement = document.getElementById("root");

// Store root in a way that persists across HMR
if (!window.__REACT_ROOT__) {
 window.__REACT_ROOT__ = ReactDOM.createRoot(rootElement);
}

// Render the app
window.__REACT_ROOT__.render(<Root />);

// Handle hot module replacement
if (import.meta.hot) {
 import.meta.hot.accept("./App.jsx", () => {
 // Re-render on hot reload
 window.__REACT_ROOT__.render(<Root />);
 });
 
 import.meta.hot.dispose(() => {
 // Cleanup on full page reload
 if (window.__REACT_ROOT__) {
 window.__REACT_ROOT__.unmount();
 window.__REACT_ROOT__ = null;
 }
 });
}
