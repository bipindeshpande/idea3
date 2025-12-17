/**
 * Card - Standard card container component
 * 
 * @param {ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 * @param {'sm' | 'md' | 'lg'} padding - Padding size (default: 'md')
 */
import UICard from "./ui-card.jsx";

export default function Card({ 
 children, 
 className = "",
 padding = "md" 
}) {
 const paddingClasses = {
   sm: "ui-pad-sm",
   md: "ui-pad-md",
   lg: "ui-pad-lg",
 };

 return (
   <UICard className={[paddingClasses[padding], className].filter(Boolean).join(" ")}>
     {children}
   </UICard>
 );
}

