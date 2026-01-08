/**
 * Utility function to generate breadcrumb structured data
 * @param {Array} items - Array of {name, url} objects
 * @returns {Object} BreadcrumbList structured data
 */
export function generateBreadcrumbs(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Common breadcrumb patterns
 */
export const breadcrumbPatterns = {
  product: [
    { name: "Home", url: "https://ideabunch.com" },
    { name: "Product", url: "https://ideabunch.com/product" }
  ],
  productDiscover: [
    { name: "Home", url: "https://ideabunch.com" },
    { name: "Product", url: "https://ideabunch.com/product" },
    { name: "Discover Ideas", url: "https://ideabunch.com/product/discover" }
  ],
  productValidate: [
    { name: "Home", url: "https://ideabunch.com" },
    { name: "Product", url: "https://ideabunch.com/product" },
    { name: "Validate Ideas", url: "https://ideabunch.com/product/validate" }
  ],
  productNetwork: [
    { name: "Home", url: "https://ideabunch.com" },
    { name: "Product", url: "https://ideabunch.com/product" },
    { name: "Founder Network", url: "https://ideabunch.com/product/network" }
  ],
  pricing: [
    { name: "Home", url: "https://ideabunch.com" },
    { name: "Pricing", url: "https://ideabunch.com/pricing" }
  ],
  resources: [
    { name: "Home", url: "https://ideabunch.com" },
    { name: "Resources", url: "https://ideabunch.com/resources" }
  ],
  resourcesTemplates: [
    { name: "Home", url: "https://ideabunch.com" },
    { name: "Resources", url: "https://ideabunch.com/resources" },
    { name: "Templates", url: "https://ideabunch.com/resources/templates" }
  ],
  blog: [
    { name: "Home", url: "https://ideabunch.com" },
    { name: "Blog", url: "https://ideabunch.com/blog" }
  ],
  about: [
    { name: "Home", url: "https://ideabunch.com" },
    { name: "About", url: "https://ideabunch.com/about" }
  ],
  contact: [
    { name: "Home", url: "https://ideabunch.com" },
    { name: "Contact", url: "https://ideabunch.com/contact" }
  ]
};

