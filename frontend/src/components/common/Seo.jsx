import { Helmet } from "react-helmet-async";

const SITE_URL = "https://ideabunch.com";
const SITE_NAME = "Idea Bunch";
const PRODUCT_TAGLINE = "Startup Idea Advisor"; // Product description/tagline
const TWITTER_HANDLE = "@ideabunch"; // Update with actual Twitter handle if available

export default function Seo({
 title = "Idea Bunch",
 description = "AI-assisted startup idea generator that transforms your goals, time, and skills into actionable opportunities.",
 path = "/",
 keywords = "ai startup ideas, business idea generator, personalized startup recommendations",
 type = "website",
 ogImage = `${SITE_URL}/og-image.jpg`,
 ogTitle,
 ogDescription,
 structuredData,
 breadcrumbs,
 children,
}) {
 const canonical = `${SITE_URL}${path}`;
 
 // Default structured data if not provided
 const defaultStructuredData = structuredData || {
   "@context": "https://schema.org",
   "@type": "WebPage",
   name: title,
   description: description,
   url: canonical,
 };

 // Combine structured data with breadcrumbs if provided
 let finalStructuredData;
 if (Array.isArray(structuredData)) {
   // If structuredData is already an array, add breadcrumbs if provided
   finalStructuredData = breadcrumbs ? [...structuredData, breadcrumbs] : structuredData;
 } else if (structuredData) {
   // If structuredData is an object, combine with breadcrumbs
   finalStructuredData = breadcrumbs ? [structuredData, breadcrumbs] : structuredData;
 } else {
   // Use default and add breadcrumbs if provided
   finalStructuredData = breadcrumbs ? [defaultStructuredData, breadcrumbs] : defaultStructuredData;
 }

 // Ensure we always have an array for JSON-LD
 const structuredDataArray = Array.isArray(finalStructuredData) 
   ? finalStructuredData 
   : [finalStructuredData];

 return (
 <Helmet>
 <title>{title}</title>
 <meta name="description" content={description} />
 <meta name="keywords" content={keywords} />
 <link rel="canonical" href={canonical} />
 
 {/* Favicon and App Icons */}
 <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=5" />
 <link rel="icon" type="image/png" sizes="64x64" href="/favicon-64x64.png?v=3" />
 <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png?v=3" />
 <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3" />
 <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=3" />
 <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />

 {/* Open Graph Tags */}
 <meta property="og:type" content={type} />
 <meta property="og:site_name" content={SITE_NAME} />
 <meta property="og:locale" content="en_US" />
 <meta property="og:title" content={ogTitle || title} />
 <meta property="og:description" content={ogDescription || description} />
 <meta property="og:url" content={canonical} />
 <meta property="og:image" content={ogImage} />
 <meta property="og:image:width" content="1200" />
 <meta property="og:image:height" content="630" />
 <meta property="og:image:alt" content={ogTitle || title} />

 {/* Twitter Card Tags */}
 <meta name="twitter:card" content="summary_large_image" />
 <meta name="twitter:site" content={TWITTER_HANDLE} />
 <meta name="twitter:creator" content={TWITTER_HANDLE} />
 <meta name="twitter:title" content={ogTitle || title} />
 <meta name="twitter:description" content={ogDescription || description} />
 <meta name="twitter:image" content={ogImage} />
 <meta name="twitter:image:alt" content={ogTitle || title} />
 
 {/* Structured Data (JSON-LD) */}
 <script type="application/ld+json">
 {JSON.stringify(structuredDataArray)}
 </script>

 {children}
 </Helmet>
 );
}
