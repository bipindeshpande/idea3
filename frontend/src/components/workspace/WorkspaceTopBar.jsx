import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle.jsx";
import UserMenu from "../common/UserMenu.jsx";
import UIHeading from "../ui/ui-heading.jsx";
import { WORKSPACE_TYPOGRAPHY } from "./WorkspaceTheme.js";

function getHelpPath(pathname) {
 if (pathname.startsWith("/help")) {
  return null; // On help page, show back functionality
 }
 if (pathname.startsWith("/validate-idea") || pathname.startsWith("/validate-result")) {
  return "/help/validate-idea";
 }
 if (pathname.startsWith("/advisor")) {
  return "/help/discover";
 }
 if (pathname.startsWith("/founder-connect")) {
  return "/help/founder-network";
 }
 if (pathname.startsWith("/dashboard/frameworks")) {
  return "/help/frameworks";
 }
 if (pathname.startsWith("/dashboard")) {
  return "/help/workspace";
 }
 if (pathname.startsWith("/account")) {
  return "/help/account";
 }
 return null;
}

function getReturnPath(pathname) {
 // Extract the original path from help page
 if (pathname === "/help/validate-idea") {
  return "/validate-idea";
 }
 if (pathname === "/help/discover") {
  return "/advisor";
 }
 if (pathname === "/help/founder-network") {
  return "/founder-connect";
 }
 if (pathname === "/help/frameworks") {
  return "/dashboard/frameworks";
 }
 if (pathname === "/help/workspace") {
  return "/dashboard";
 }
 if (pathname === "/help/account") {
  return "/account";
 }
 return "/dashboard"; // Default fallback
}

export default function WorkspaceTopBar({ title, subtitle }) {
 const { pathname } = useLocation();
 const navigate = useNavigate();
 const helpPath = getHelpPath(pathname);
 const isHelpPage = pathname.startsWith("/help");
 const returnPath = isHelpPage ? getReturnPath(pathname) : null;

 const handleHelpClick = () => {
  if (isHelpPage && returnPath) {
   navigate(returnPath);
  } else if (helpPath) {
   navigate(helpPath);
  }
 };

 if (!helpPath && !isHelpPage) {
  // No help available for this page
  return (
   <div className="mb-3 flex items-center justify-between border-b border-default pb-2">
    <div className="flex-1 flex items-center gap-2">
     {title && <UIHeading level="h2" className={WORKSPACE_TYPOGRAPHY.h2}>{title}</UIHeading>}
     {subtitle && (
      <>
       <span className="text-secondary">·</span>
       <p className={WORKSPACE_TYPOGRAPHY.subtitle}>{subtitle}</p>
      </>
     )}
    </div>
    <div className="flex items-center gap-2 ml-6">
     <ThemeToggle />
     <UserMenu />
    </div>
   </div>
  );
 }

 return (
 <div className="mb-3 flex items-center justify-between border-b border-default pb-2">
 <div className="flex-1 flex items-center gap-2">
 {title && <UIHeading level="h2" className={WORKSPACE_TYPOGRAPHY.h2}>{title}</UIHeading>}
 {subtitle && (
  <>
   <span className="text-secondary">·</span>
   <p className={WORKSPACE_TYPOGRAPHY.subtitle}>{subtitle}</p>
  </>
 )}
 </div>
 <div className="flex items-center gap-2 ml-6">
 <button
  onClick={handleHelpClick}
  className="w-9 h-9 flex items-center justify-center rounded-lg border border-default hover:bg-surface-hover transition-colors text-secondary hover:text-primary focus-visible:outline-accent"
  title={isHelpPage ? "Back to page" : "How it works"}
  aria-label={isHelpPage ? "Back to page" : "How it works"}
 >
  {isHelpPage ? (
   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
   </svg>
  ) : (
   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
   </svg>
  )}
 </button>
 <ThemeToggle />
 <UserMenu />
 </div>
 </div>
 );
}


