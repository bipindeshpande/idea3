import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import { ReportsProvider } from "./context/ReportsContext.jsx";
import { ValidationProvider } from "./context/ValidationContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./styles/theme.css";
import "./styles.css";

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
 <BrowserRouter
 future={{
 v7_startTransition: true,
 v7_relativeSplatPath: true,
 }}
 >
 <App />
 </BrowserRouter>
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
