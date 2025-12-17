import UIHeading from "./ui/ui-heading.jsx";

export default function TopBar({ title, subtitle, actions, children }) {
 return (
 <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
 <div>
 {title ? (
      <UIHeading level="h1">{title}</UIHeading>
 ) : null}
 {subtitle ? (
      <p className="mt-1 text-sm text-secondary">{subtitle}</p>
 ) : null}
 </div>
 {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
 {children ? <div className="w-full">{children}</div> : null}
 </div>
 );
}


