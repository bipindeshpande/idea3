import { useState } from "react";
import React from "react";
import { pdf } from "@react-pdf/renderer";
import ValidationReportPDF from "../../../components/pdf/ValidationReportPDF.jsx";

/**
 * Custom hook to handle PDF generation for validation reports
 */
export function usePDFGenerator() {
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const generatePDF = async ({
    validation,
    overallScore,
    scores,
    parameterGroups,
    parameterLookup,
    recommendations,
    nextSteps,
    categoryAnswers,
    ideaExplanation,
    userName,
    userEmail,
    finalConclusion,
  }) => {
    if (downloadingPDF) return;

    try {
      setDownloadingPDF(true);
      const allParameterCards = parameterGroups.flatMap(group => group.cards);
      const pdfProps = {
        validation: validation,
        overallScore: overallScore,
        scores: scores,
        parameterCards: allParameterCards,
        parameterLookup: parameterLookup || {},
        recommendations: recommendations,
        nextSteps: nextSteps,
        categoryAnswers: categoryAnswers,
        ideaExplanation: ideaExplanation,
        userName: userName || 'User',
        userEmail: userEmail || '',
        finalConclusion: finalConclusion
      };
      const pdfBlob = await pdf(<ValidationReportPDF {...pdfProps} />).toBlob();
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const validationId = validation?.id || validation?.validation_id || Date.now();
      link.download = `idea-validation-report-${validationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF: " + (err.message || "Please check the console for details."));
      throw err;
    } finally {
      setDownloadingPDF(false);
    }
  };

  return {
    downloadingPDF,
    generatePDF,
  };
}

