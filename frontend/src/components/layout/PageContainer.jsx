/**
 * PageContainer - Standard page container wrapper
 * 
 * @param {ReactNode} children - Page content
 * @param {string} maxWidth - Max width class (default: 'max-w-6xl')
 * @param {string} className - Additional CSS classes
 */
export default function PageContainer({
  children,
  maxWidth = "max-w-6xl",
  className = ""
}) {
  return (
    <section className={`mx-auto ${maxWidth} px-6 py-12 ${className}`}>
      {children}
    </section>
  );
}

