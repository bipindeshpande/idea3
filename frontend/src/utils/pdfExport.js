/**
 * PDF Export Utility for Recommendation Reports
 * Uses html2pdf.js for client-side PDF generation
 */

/**
 * Generate and download PDF of recommendation detail page
 * @param {Object} activeIdea - The idea object
 * @param {boolean} isEnriching - Whether enrichment is still loading
 */
export async function downloadRecommendationPDF(activeIdea, isEnriching) {
  if (isEnriching) {
    alert("Please wait for the recommendation to finish loading before downloading PDF.");
    return;
  }

  if (!activeIdea) {
    alert("No recommendation data available to export.");
    return;
  }

  console.log("Starting PDF generation for:", activeIdea.title);

  // Show loading indicator immediately
  const loadingDiv = document.createElement('div');
  loadingDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); color: white; padding: 30px 50px; border-radius: 12px; z-index: 10000; font-size: 18px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);';
  loadingDiv.innerHTML = '<div style="text-align: center;"><div style="font-size: 24px; margin-bottom: 10px;">📄</div><div>Generating PDF...</div><div style="font-size: 14px; margin-top: 8px; opacity: 0.8;">This may take a few seconds</div></div>';
  document.body.appendChild(loadingDiv);

  try {
    // Use browser print as it's more reliable than html2pdf
    console.log("Using browser print dialog for PDF generation");
    
    // Add print styles
    const style = document.createElement('style');
    style.id = 'pdf-print-styles';
    style.textContent = `
      @media print {
        /* Hide UI elements */
        nav, .sidebar, button, input, textarea, select,
        [data-no-pdf], .ui-btn, .no-print {
          display: none !important;
        }
        
        /* Optimize for print */
        body {
          background: white !important;
          color: black !important;
        }
        
        /* Page breaks */
        h2, h3 {
          page-break-after: avoid;
          page-break-inside: avoid;
        }
        
        .ui-card, .page-break-before {
          page-break-before: auto;
        }
        
        /* Margins */
        @page {
          margin: 0.5in;
        }
        
        /* Ensure content is visible */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Remove loading and trigger print
    setTimeout(() => {
      document.body.removeChild(loadingDiv);
      window.print();
      
      // Clean up print styles after print dialog closes
      setTimeout(() => {
        const printStyles = document.getElementById('pdf-print-styles');
        if (printStyles) {
          document.head.removeChild(printStyles);
        }
      }, 1000);
    }, 500);

  } catch (error) {
    console.error('Failed to generate PDF:', error);
    document.body.removeChild(loadingDiv);
    alert('Failed to open print dialog. Please try using your browser\'s print function (Ctrl+P or Cmd+P).');
  }
}

/**
 * Simpler PDF export using browser's print functionality
 * Fallback if html2pdf fails or isn't available
 */
export function printRecommendationPDF() {
  // Add print-specific styles
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      .no-print, button, input, textarea, select, nav, .sidebar {
        display: none !important;
      }
      .page-break-before {
        page-break-before: always;
      }
      .page-break-after {
        page-break-after: always;
      }
      .no-break {
        page-break-inside: avoid;
      }
    }
  `;
  document.head.appendChild(style);

  // Trigger print dialog
  window.print();

  // Clean up
  setTimeout(() => {
    document.head.removeChild(style);
  }, 1000);
}

