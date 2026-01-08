import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import apiClient, { ApiError } from "../utils/apiClient.js";

const AuthContext = createContext(null);
const SESSION_TOKEN_KEY = "sia_session_token";

export function AuthProvider({ children }) {
 const [user, setUser] = useState(null);
 const [sessionToken, setSessionToken] = useState(localStorage.getItem(SESSION_TOKEN_KEY));
 const [loading, setLoading] = useState(true);
 const [subscription, setSubscription] = useState(null);
 const lastActivityRef = useRef(Date.now());

 // Track user activity for inactivity timeout
 useEffect(() => {
 if (!sessionToken) return;

 const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

 const updateActivity = () => {
 lastActivityRef.current = Date.now();
 };

 const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
 events.forEach(event => {
 document.addEventListener(event, updateActivity, true);
 });

 // Use setInterval instead of recursive setTimeout for simpler cleanup
 const intervalId = setInterval(() => {
 const timeSinceActivity = Date.now() - lastActivityRef.current;
 if (timeSinceActivity >= INACTIVITY_TIMEOUT) {
 // Session expired due to inactivity
 localStorage.removeItem(SESSION_TOKEN_KEY);
 setSessionToken(null);
 setUser(null);
 setSubscription(null);
 }
 }, 60000); // Check every minute

 return () => {
 clearInterval(intervalId);
 events.forEach(event => {
 document.removeEventListener(event, updateActivity, true);
 });
 };
 }, [sessionToken]);

 const checkSubscription = useCallback(async () => {
 // Check localStorage instead of state to handle cases where state hasn't updated yet
 const token = localStorage.getItem(SESSION_TOKEN_KEY);
 if (!token) return;

 try {
 const data = await apiClient.get("/subscription/status");
 setSubscription(data.subscription);
 } catch (error) {
 // Silently fail subscription check - don't disrupt user experience
 if (process.env.NODE_ENV === 'development') {
 console.error("Subscription check failed:", error);
 }
 }
 }, []);

 const checkAuth = useCallback(async () => {
 if (!sessionToken) {
 setUser(null);
 setSubscription(null);
 setLoading(false);
 return;
 }

 try {
 // Use API client but handle 401 silently (don't redirect during auth check)
 const data = await apiClient.get("/auth/me", { skipAuthRedirect: true });
 setUser(data.user);
 await checkSubscription();
 } catch (error) {
 // Handle 401 silently (session expired/invalid)
 if (error instanceof ApiError && error.status === 401) {
 // Silently clear session - this is expected behavior
 localStorage.removeItem(SESSION_TOKEN_KEY);
 setSessionToken(null);
 setUser(null);
 setSubscription(null);
 } else {
 // Log other errors but still clear session
 console.error("Auth check failed:", error);
 localStorage.removeItem(SESSION_TOKEN_KEY);
 setSessionToken(null);
 setUser(null);
 setSubscription(null);
 }
 } finally {
 setLoading(false);
 }
 }, [sessionToken, checkSubscription]);

 // Load user on mount
 useEffect(() => {
 if (sessionToken) {
 checkAuth();
 } else {
 setLoading(false);
 }
 }, [sessionToken, checkAuth]);

 const register = useCallback(async (email, password) => {
 try {
 const data = await apiClient.post("/auth/register", { email, password });
 
 if (data.success) {
 if (!data.session_token) {
 console.error('No session_token in response:', data);
 return { success: false, error: "Registration succeeded but no session token received" };
 }
 localStorage.setItem(SESSION_TOKEN_KEY, data.session_token);
 setSessionToken(data.session_token);
 setUser(data.user);
 await checkSubscription();
 return { success: true };
 } else {
 return { success: false, error: data.error || "Registration failed" };
 }
 } catch (error) {
 if (error instanceof ApiError) {
 return { success: false, error: error.message };
 }
 console.error("Registration error:", error);
 return { success: false, error: error.message || "Network error" };
 }
 }, [checkSubscription]);

 const login = useCallback(async (email, password) => {
 try {
 const data = await apiClient.post("/auth/login", { email, password });
 
 if (data.success) {
 if (!data.session_token) {
 console.error('No session_token in response:', data);
 return { success: false, error: "Login succeeded but no session token received" };
 }
 localStorage.setItem(SESSION_TOKEN_KEY, data.session_token);
 setSessionToken(data.session_token);
 setUser(data.user);
 await checkSubscription();
 return { success: true };
 } else {
 return { success: false, error: data.error || "Login failed" };
 }
 } catch (error) {
 if (error instanceof ApiError) {
 return { success: false, error: error.message };
 }
 console.error("Login exception:", error);
 return { success: false, error: error.message || "Network error" };
 }
 }, [checkSubscription]);

 const logout = useCallback(async () => {
 try {
 if (sessionToken) {
 await apiClient.post("/auth/logout");
 }
 } catch (error) {
 // Silently fail logout on backend - still clear local state
 if (process.env.NODE_ENV === 'development') {
 console.error("Logout failed:", error);
 }
 } finally {
 localStorage.removeItem(SESSION_TOKEN_KEY);
 setSessionToken(null);
 setUser(null);
 setSubscription(null);
 }
 }, [sessionToken]);

 const forgotPassword = useCallback(async (email) => {
 try {
 const data = await apiClient.post("/auth/forgot-password", { email });
 return { success: data.success, message: data.message, reset_link: data.reset_link };
 } catch (error) {
 if (error instanceof ApiError) {
 return { success: false, error: error.message };
 }
 return { success: false, error: error.message || "Network error" };
 }
 }, []);

 const resetPassword = useCallback(async (token, password) => {
 try {
 const data = await apiClient.post("/auth/reset-password", { token, password });
 return { success: data.success, error: data.error, message: data.message };
 } catch (error) {
 if (error instanceof ApiError) {
 return { success: false, error: error.message };
 }
 return { success: false, error: error.message || "Network error" };
 }
 }, []);

 const changePassword = useCallback(async (currentPassword, newPassword) => {
 if (!sessionToken) {
 return { success: false, error: "Not authenticated" };
 }

 try {
 const data = await apiClient.post("/auth/change-password", {
 current_password: currentPassword,
 new_password: newPassword,
 });
 return { success: data.success, error: data.error, message: data.message };
 } catch (error) {
 if (error instanceof ApiError) {
 return { success: false, error: error.message };
 }
 return { success: false, error: error.message || "Network error" };
 }
 }, [sessionToken]);

 const refreshSubscription = useCallback(async () => {
 await checkSubscription();
 }, [checkSubscription]);

 const getAuthHeaders = useCallback(() => {
 if (!sessionToken) return {};
 return {
 Authorization: `Bearer ${sessionToken}`,
 };
 }, [sessionToken]);

 const value = useMemo(
 () => ({
 user,
 subscription,
 sessionToken,
 loading,
 isAuthenticated: !!user,
 isSubscriptionActive: subscription?.is_active ?? false,
 register,
 login,
 logout,
 forgotPassword,
 resetPassword,
 changePassword,
 refreshSubscription,
 checkSubscription,
 checkAuth,
 getAuthHeaders,
 }),
 [user, subscription, sessionToken, loading, register, login, logout, forgotPassword, resetPassword, changePassword, refreshSubscription, checkSubscription, checkAuth, getAuthHeaders]
 );

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
 const context = useContext(AuthContext);
 if (!context) {
 throw new Error("useAuth must be used within AuthProvider");
 }
 return context;
}

