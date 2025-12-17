import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
 // Initialize theme from localStorage or default to 'light'
 // Apply synchronously before React renders to prevent flash
 const [theme, setTheme] = useState(() => {
 if (typeof window !== "undefined") {
 const savedTheme = localStorage.getItem("theme") || "light";
 const root = document.documentElement;
 root.setAttribute("data-theme", savedTheme);
 return savedTheme;
 }
 return "light";
 });

 // Apply theme when it changes
 useEffect(() => {
 const root = document.documentElement;
 root.setAttribute("data-theme", theme);
 localStorage.setItem("theme", theme);
 }, [theme]);

 const toggleTheme = () => {
 setTheme((prev) => (prev === "light" ? "dark" : "light"));
 };

 return (
 <ThemeContext.Provider value={{ theme, toggleTheme }}>
 {children}
 </ThemeContext.Provider>
 );
}

export function useTheme() {
 const context = useContext(ThemeContext);
 if (!context) {
 throw new Error("useTheme must be used within ThemeProvider");
 }
 return context;
}

