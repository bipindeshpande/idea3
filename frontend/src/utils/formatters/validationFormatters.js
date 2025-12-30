import { personalizeCopy } from "./textFormatters.js";
import { extractListFromText } from "./textFormatters.js";

const VALIDATION_TEMPLATES = [
  {
    question: "What signal would convince you that {{idea}} solves a burning pain for {{audience}}?",
    listenFor: "Watch for specific moments where the pain shows up, and which workaround they rely on today.",
    actOn: "Use their answer to prioritize problem statements in your landing page or interview script.",
  },
  {
    question: "How would your ideal customer describe success after using {{idea}} for a month?",
    listenFor: "Look for tangible outcomes or metrics they expect to improve, not vague feelings.",
    actOn: "Translate their desired outcome into your product promise and onboarding checklist.",
  },
  {
    question: "Which paid channel or partnership can prove traction for {{idea}} without exceeding your budget?",
    listenFor: "Note channels they already trust or partners who can introduce them to new audiences quickly.",
    actOn: "Use the responses to shape your first acquisition experiment and outreach list.",
  },
  {
    question: "What outcome must happen in the next 30 days for you to double down on {{idea}}?",
    listenFor: "Identify the minimum viable proof they need—usage, lead volume, or revenue threshold.",
    actOn: "Convert that outcome into an experiment metric so you know when to scale or pivot.",
  },
  {
    question: "What makes {{idea}} the best use of your time compared with other paths toward {{goal}}?",
    listenFor: "Listen for advantages that differentiate you—speed, domain expertise, or available assets.",
    actOn: "Highlight those advantages in your pitch and deprioritize activities that don't leverage them.",
  },
  {
    question: "Who can give you the fastest, most honest feedback on the core promise of {{idea}}?",
    listenFor: "Names of customer segments, advisors, or distribution partners who influence decisions.",
    actOn: "Reach out to the people mentioned and structure interviews around their decision criteria.",
  },
  {
    question: "What retention or repeat behavior will show {{idea}} is building long-term value?",
    listenFor: "Seek concrete behaviors—monthly usage, renewals, referrals—rather than general satisfaction.",
    actOn: "Track the behavior they cite as your north-star metric during pilot tests.",
  },
];

/**
 * Extract validation questions from section text
 */
export function extractValidationQuestions(sectionText = "") {
  return extractListFromText(sectionText);
}

/**
 * Build validation questions with listenFor and actOn guidance
 */
export function buildValidationQuestions(sectionText = "", ideaTitle = "", audience = "", goal = "") {
  const list = extractValidationQuestions(sectionText);
  const combined = [];
  const seen = new Set();

  const normalizedIdea = ideaTitle || "this idea";
  const normalizedAudience = audience || "your target customers";
  const normalizedGoal = goal || "your primary goal";

  list.forEach((item, index) => {
    // Parse the item to extract question, listenFor, and actOn
    const lines = item.split(/\n/).map(l => l.trim()).filter(l => l);
    let question = "";
    let listenFor = null;
    let actOn = null;
    
    // Find the question (usually the first line that's not a "What to listen for" or "Act on it" line)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/what\s+to\s+listen\s+for[:\-]/i)) {
        listenFor = line.replace(/what\s+to\s+listen\s+for[:\-]\s*/i, "").trim();
      } else if (line.match(/act\s+on\s+it[:\-]/i)) {
        actOn = line.replace(/act\s+on\s+it[:\-]\s*/i, "").trim();
      } else if (!question && line.length > 10 && !line.match(/^[-*+]\s*$/)) {
        // First substantial line that's not a bullet point marker is likely the question
        question = line.replace(/^[-*+]\s*/, "").replace(/^\d+\.\s*/, "").trim();
      }
    }
    
    // If no question found, use the first line
    if (!question && lines.length > 0) {
      question = lines[0].replace(/^[-*+]\s*/, "").replace(/^\d+\.\s*/, "").trim();
    }
    
    const cleaned = personalizeCopy(question);
    const fingerprint = cleaned.toLowerCase();
    
    if (!seen.has(fingerprint) && question) {
      seen.add(fingerprint);
      
      // If listenFor/actOn not found in markdown, match question to appropriate template
      if (!listenFor || !actOn) {
        const questionLower = cleaned.toLowerCase();
        let templateIndex = 0;
        
        // Match question content to appropriate template
        if (questionLower.includes("pain point") || questionLower.includes("problem") || questionLower.includes("challenge") || questionLower.includes("biggest")) {
          templateIndex = 0; // Pain point question
        } else if (questionLower.includes("success") || questionLower.includes("outcome") || questionLower.includes("result") || questionLower.includes("describe")) {
          templateIndex = 1; // Success/outcome question
        } else if (questionLower.includes("channel") || questionLower.includes("partnership") || questionLower.includes("marketing") || questionLower.includes("paid")) {
          templateIndex = 2; // Channel/partnership question
        } else if (questionLower.includes("30 days") || questionLower.includes("double down") || questionLower.includes("outcome must")) {
          templateIndex = 3; // 30-day outcome question
        } else if (questionLower.includes("best use") || questionLower.includes("time") || questionLower.includes("compared") || questionLower.includes("other paths")) {
          templateIndex = 4; // Best use of time question
        } else if (questionLower.includes("feedback") || questionLower.includes("honest") || questionLower.includes("advice") || questionLower.includes("fastest")) {
          templateIndex = 5; // Feedback question
        } else if (questionLower.includes("retention") || questionLower.includes("repeat") || questionLower.includes("long-term") || questionLower.includes("behavior")) {
          templateIndex = 6; // Retention question
        } else {
          // Default: cycle through templates based on index
          templateIndex = index % VALIDATION_TEMPLATES.length;
        }
        
        const template = VALIDATION_TEMPLATES[templateIndex] || VALIDATION_TEMPLATES[0];
        listenFor = listenFor || personalizeCopy(
          template.listenFor
            .replace(/{{idea}}/g, normalizedIdea)
            .replace(/{{audience}}/g, normalizedAudience)
            .replace(/{{goal}}/g, normalizedGoal)
        );
        actOn = actOn || personalizeCopy(
          template.actOn
            .replace(/{{idea}}/g, normalizedIdea)
            .replace(/{{audience}}/g, normalizedAudience)
            .replace(/{{goal}}/g, normalizedGoal)
        );
      }
      
      combined.push({
        question: cleaned,
        listenFor: listenFor || "Listen for specific, concrete answers that reveal the customer's true needs and priorities.",
        actOn: actOn || "Use the response to inform your product development, messaging, or go-to-market strategy.",
      });
    }
  });

  // Fill up to 6 questions if needed using templates
  let templateIndex = 0;
  while (combined.length < 6 && templateIndex < VALIDATION_TEMPLATES.length) {
    const template = VALIDATION_TEMPLATES[templateIndex];
    const question = personalizeCopy(
      template.question
        .replace(/{{idea}}/g, normalizedIdea)
        .replace(/{{audience}}/g, normalizedAudience)
        .replace(/{{goal}}/g, normalizedGoal)
    );
    const listenFor = personalizeCopy(
      template.listenFor
        .replace(/{{idea}}/g, normalizedIdea)
        .replace(/{{audience}}/g, normalizedAudience)
        .replace(/{{goal}}/g, normalizedGoal)
    );
    const actOn = personalizeCopy(
      template.actOn
        .replace(/{{idea}}/g, normalizedIdea)
        .replace(/{{audience}}/g, normalizedAudience)
        .replace(/{{goal}}/g, normalizedGoal)
    );
    const fingerprint = question.toLowerCase();
    if (!seen.has(fingerprint)) {
      seen.add(fingerprint);
      combined.push({
        question,
        listenFor,
        actOn,
      });
    }
    templateIndex += 1;
  }

  return combined;
}
