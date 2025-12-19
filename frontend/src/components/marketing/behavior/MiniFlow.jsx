import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import QuickQuestion from "./QuickQuestion.jsx";
import OutputPreview from "./OutputPreview.jsx";
import UIButton from "../../ui/ui-button.jsx";

/**
 * MiniFlow - A 3-step behavioral guide with progressive reveal
 * V9: Behavioral Sequencing component
 */
export default function MiniFlow({
  title,
  steps = [],
  onComplete,
  preview,
  ctaLabel = "Continue with My Results",
  ctaTo,
  className = "",
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (stepIndex, answer, answerIndex) => {
    const newAnswers = { ...answers, [stepIndex]: { answer, index: answerIndex } };
    setAnswers(newAnswers);

    // Move to next step if not last step
    if (stepIndex < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(stepIndex + 1);
      }, 300);
    } else {
      // Last step completed
      setIsComplete(true);
      if (onComplete) {
        onComplete(newAnswers);
      }
    }
  };

  // Reveal animation for completed steps
  useEffect(() => {
    const elements = document.querySelectorAll(".mkt-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [currentStep]);

  return (
    <div className={className}>
      <div className="max-w-2xl mx-auto px-4">
        {title && (
          <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: "var(--mkt-heading)" }}>
            {title}
          </h3>
        )}

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={index} className={index <= currentStep ? "" : "hidden"}>
              <div className="flex items-start gap-3 mb-4">
                <span className="mkt-step-badge-micro">{index + 1}</span>
                <div className="flex-1">
                  <QuickQuestion
                    question={step.question}
                    options={step.options}
                    onSelect={(answer, answerIndex) => handleAnswer(index, answer, answerIndex)}
                    revealDelay={index * 100}
                  />
                </div>
              </div>
            </div>
          ))}

          {isComplete && preview && (
            <div className="mkt-reveal mt-8">
              <OutputPreview
                title={preview.title}
                bullets={preview.bullets}
                previewText={preview.previewText || "You will get results like this →"}
              />
            </div>
          )}

          {isComplete && ctaTo && (
            <div className="mkt-reveal mt-6 text-center">
              <UIButton
                as={Link}
                to={ctaTo}
                variant="primary"
                className="ui-button ui-button--primary px-6 py-3 text-base font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                style={{
                  background: "var(--mkt-primary)",
                  color: "white",
                  boxShadow: "var(--mkt-card-shadow)",
                }}
              >
                {ctaLabel}
              </UIButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

