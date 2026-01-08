import { useMemo } from "react";
import { VALIDATION_PARAMETERS, PARAMETER_GROUPS_LAYOUT, RADAR_AXES } from "../constants.js";
import { getScoreFromScores, normalizeKey } from "../utils.js";

/**
 * Formats recommendations text, converting numbered lists to bullets and cleaning markdown
 */
function formatRecommendations(rawRecommendations) {
  if (!rawRecommendations) return "";

  // Ensure it's a string
  let text = typeof rawRecommendations === 'string' ? rawRecommendations : String(rawRecommendations || "");

  // Clean up stray ** markers that aren't part of proper markdown formatting
  text = text
    .replace(/\*\*([^*]+?)\*\*/g, '___BOLD___$1___BOLD___')
    .replace(/\*\*/g, '')
    .replace(/___BOLD___/g, '**');

  // Process each line to convert numbered lists to bullets and break down descriptions
  const lines = text.split('\n');
  const processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines (but preserve them for spacing)
    if (line === '') {
      processedLines.push('');
      continue;
    }

    // If it's a heading, keep it as is
    if (line.startsWith('#')) {
      processedLines.push(line);
      continue;
    }

    // If it's a numbered list item (e.g., "1. **Title**: Description")
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      const content = numberedMatch[2];
      // Check if content has a colon (title: description format)
      const colonIndex = content.indexOf(':');
      if (colonIndex > 0 && colonIndex < content.length - 10) {
        // Split title and description
        const title = content.substring(0, colonIndex).trim();
        const description = content.substring(colonIndex + 1).trim();

        // Add the main bullet with title (clean any stray **)
        const cleanTitle = title.replace(/\*\*/g, '').trim();
        processedLines.push(`- **${cleanTitle}**:`);

        // Break down description into sub-bullets for better readability
        const numberedItemPattern = /(\*\*)?(\d+)\.\s+(\*\*)?([^:]+?)(\*\*)?:\s*([^**]+?)(?=\s*(?:\*\*)?\d+\.|$)/g;
        let numberedMatches = [];
        let match;
        const descriptionCopy = description;
        while ((match = numberedItemPattern.exec(descriptionCopy)) !== null) {
          numberedMatches.push({
            fullMatch: match[0],
            title: (match[4] || '').trim(),
            description: (match[6] || '').trim(),
            index: match.index
          });
        }

        if (numberedMatches.length > 0) {
          // Extract the first part before any numbered items
          if (numberedMatches[0].index > 0) {
            const beforeText = description.substring(0, numberedMatches[0].index).trim();
            if (beforeText.length > 10) {
              const cleanedBeforeText = beforeText.replace(/\*\*/g, '').trim();
              processedLines.push(` - ${cleanedBeforeText}`);
            }
          }

          // Convert each numbered item to a main bullet point
          numberedMatches.forEach((item, idx) => {
            const itemTitle = item.title;
            let itemDescription = item.description;

            // Check if this description contains the next numbered item
            if (idx < numberedMatches.length - 1) {
              const nextItemIndex = itemDescription.indexOf(numberedMatches[idx + 1].fullMatch);
              if (nextItemIndex > 0) {
                itemDescription = itemDescription.substring(0, nextItemIndex).trim();
              }
            }

            if (itemTitle) {
              const cleanItemTitle = itemTitle.replace(/\*\*/g, '').trim();
              processedLines.push(`- **${cleanItemTitle}**:`);
              if (itemDescription && itemDescription.length > 10) {
                const cleanedDescription = itemDescription.replace(/\*\*/g, '').trim();
                processedLines.push(` - ${cleanedDescription}`);
              }
            }
          });
        } else if (description.length > 80) {
          // Try to split by sentences first
          const sentences = description.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s => s.trim().length > 20);
          if (sentences.length > 1) {
            sentences.forEach(sentence => {
              const cleanedSentence = sentence.trim().replace(/\*\*/g, '');
              processedLines.push(` - ${cleanedSentence}`);
            });
          } else {
            // If single sentence, try splitting by common separators
            const separators = [';', '—', '–', '. ', ', and ', ', or '];
            let split = false;
            for (const sep of separators) {
              if (description.includes(sep)) {
                const parts = description.split(sep).filter(p => p.trim().length > 20);
                if (parts.length > 1) {
                  parts.forEach(part => {
                    processedLines.push(` - ${part.trim()}`);
                  });
                  split = true;
                  break;
                }
              }
            }
            if (!split) {
              // If still can't split, try splitting by periods followed by space
              const periodSplit = description.split(/\.\s+/).filter(s => s.trim().length > 20);
              if (periodSplit.length > 1) {
                periodSplit.forEach(part => {
                  const cleanedPart = part.trim().replace(/\*\*/g, '');
                  processedLines.push(` - ${cleanedPart}.`);
                });
              } else {
                const cleanedDescription = description.replace(/\*\*/g, '').trim();
                processedLines.push(` - ${cleanedDescription}`);
              }
            }
          }
        } else {
          // Short description, keep as single sub-bullet
          const cleanedDescription = description.replace(/\*\*/g, '').trim();
          processedLines.push(` - ${cleanedDescription}`);
        }
      } else {
        // No colon, convert numbered to bullet
        const cleanedContent = content.replace(/\*\*/g, '').trim();
        processedLines.push(`- ${cleanedContent}`);
      }
      continue;
    }

    // If it's already a bullet point, keep it but process the content
    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      const content = bulletMatch[1];
      const colonIndex = content.indexOf(':');
      if (colonIndex > 0 && colonIndex < content.length - 10) {
        const title = content.substring(0, colonIndex).trim();
        const description = content.substring(colonIndex + 1).trim();

        const cleanTitle2 = title.replace(/\*\*/g, '').trim();
        processedLines.push(`- **${cleanTitle2}**:`);

        // Break down description into sub-bullets if it's long
        if (description.length > 50) {
          const sentences = description.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s => s.trim().length > 15);
          if (sentences.length > 1) {
            sentences.forEach(sentence => {
              const cleanedSentence = sentence.trim().replace(/\*\*/g, '');
              processedLines.push(` - ${cleanedSentence}`);
            });
          } else {
            const separators = [';', '—', '–', ', and', ', or'];
            let split = false;
            for (const sep of separators) {
              if (description.includes(sep)) {
                const parts = description.split(sep).filter(p => p.trim().length > 15);
                if (parts.length > 1) {
                  parts.forEach(part => {
                    const cleanedPart = part.trim().replace(/\*\*/g, '');
                    processedLines.push(` - ${cleanedPart}`);
                  });
                  split = true;
                  break;
                }
              }
            }
            if (!split) {
              const cleanedDescription = description.replace(/\*\*/g, '').trim();
              processedLines.push(` - ${cleanedDescription}`);
            }
          }
        } else {
          const cleanedDescription = description.replace(/\*\*/g, '').trim();
          processedLines.push(` - ${cleanedDescription}`);
        }
      } else {
        const cleanedContent = content.replace(/\*\*/g, '').trim();
        processedLines.push(`- ${cleanedContent}`);
      }
      continue;
    }

    // Regular paragraph - try to convert to bullets
    if (line.length > 50) {
      const sentences = line.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s => s.trim().length > 20);
      if (sentences.length > 1) {
        sentences.forEach(sentence => {
          const cleanedSentence = sentence.trim().replace(/\*\*/g, '');
          processedLines.push(`- ${cleanedSentence}`);
        });
      } else {
        const separators = [';', '—', '–'];
        let split = false;
        for (const sep of separators) {
          if (line.includes(sep)) {
            const parts = line.split(sep).filter(p => p.trim().length > 20);
            if (parts.length > 1) {
              parts.forEach(part => {
                const cleanedPart = part.trim().replace(/\*\*/g, '');
                processedLines.push(`- ${cleanedPart}`);
              });
              split = true;
              break;
            }
          }
        }
        if (!split) {
          const cleanedLine = line.replace(/\*\*/g, '').trim();
          processedLines.push(`- ${cleanedLine}`);
        }
      }
    } else {
      const cleanedLine = line.replace(/\*\*/g, '').trim();
      processedLines.push(`- ${cleanedLine}`);
    }
  }

  let result = processedLines.join('\n');

  // Final cleanup: remove any remaining stray ** that aren't part of proper markdown bold syntax
  result = result
    .replace(/\*\*([^*\n]+?)\*\*/g, '___BOLD_START___$1___BOLD_END___')
    .replace(/\*\*/g, '')
    .replace(/___BOLD_START___/g, '**')
    .replace(/___BOLD_END___/g, '**');

  return result;
}

/**
 * Formats next steps, converting comma-separated format to proper markdown list
 */
function formatNextSteps(rawNextSteps) {
  // Ensure rawNextSteps is a string - handle all edge cases
  let nextStepsStr = "";
  try {
    if (rawNextSteps === null || rawNextSteps === undefined) {
      nextStepsStr = "";
    } else if (typeof rawNextSteps === 'string') {
      nextStepsStr = rawNextSteps;
    } else if (Array.isArray(rawNextSteps)) {
      nextStepsStr = rawNextSteps.join("\n\n");
    } else {
      nextStepsStr = String(rawNextSteps);
    }
  } catch (e) {
    nextStepsStr = "";
  }

  if (typeof nextStepsStr !== 'string') {
    nextStepsStr = String(nextStepsStr || "");
  }

  if (!nextStepsStr || nextStepsStr.length === 0) return "";

  // Check if it's comma-separated (common AI output format)
  if (typeof nextStepsStr.match === 'function' && nextStepsStr.match(/,\d+\./)) {
    const splitPattern = /(,\d+\.\s*)/g;
    const items = [];
    let lastIndex = 0;
    let match;

    while ((match = splitPattern.exec(nextStepsStr)) !== null) {
      if (match.index > lastIndex) {
        const item = nextStepsStr.substring(lastIndex, match.index).trim();
        if (item && item.match(/^\d+\./)) {
          items.push(item);
        }
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < nextStepsStr.length) {
      const lastItem = nextStepsStr.substring(lastIndex).trim();
      if (lastItem && lastItem.match(/^\d+\./)) {
        items.push(lastItem);
      }
    }

    const firstMatch = /,\d+\./.exec(nextStepsStr);
    if (firstMatch && firstMatch.index > 0) {
      const firstItem = nextStepsStr.substring(0, firstMatch.index).trim();
      if (firstItem && firstItem.match(/^\d+\./)) {
        if (items.length === 0 || items[0] !== firstItem) {
          items.unshift(firstItem);
        }
      }
    } else if (items.length === 0 &&
      typeof nextStepsStr.match === 'function' &&
      nextStepsStr.match(/^\d+\./)) {
      items.push(nextStepsStr.trim());
    }

    if (items.length > 0) {
      const formatted = items.join("\n\n");
      if (typeof formatted === 'string' && formatted.length > 0) {
        return formatted;
      }
    }
  }

  // Fallback: try a simpler split approach
  if (typeof nextStepsStr.includes === 'function' &&
    typeof nextStepsStr.match === 'function' &&
    nextStepsStr.includes(',') &&
    nextStepsStr.match(/\d+\./)) {
    const simpleSplit = nextStepsStr.split(/(?=,\d+\.)/);
    if (simpleSplit.length > 1) {
      const cleaned = simpleSplit
        .map(item => item.trim().replace(/^,\s*/, ''))
        .filter(item => item && item.match(/^\d+\./))
        .join("\n\n");
      if (cleaned && cleaned.length > 0) {
        return cleaned;
      }
    }
  }

  return nextStepsStr;
}

/**
 * Custom hook to process validation data into formatted components
 */
export function useValidationProcessing(validation, categoryAnswers, ideaExplanation, viewFilter, sortOption) {
  const scores = validation?.scores || {};
  const overallScore = validation?.overall_score || 0;
  const rawRecommendations = validation?.recommendations || "";
  const rawNextSteps = validation?.next_steps || "";

  // Format recommendations
  const recommendations = useMemo(() => formatRecommendations(rawRecommendations), [rawRecommendations]);

  // Format next steps
  const nextSteps = useMemo(() => formatNextSteps(rawNextSteps), [rawNextSteps]);

  // Build parameter lookup
  const parameterLookup = useMemo(() => {
    const detailsMap = validation?.details || {};
    const lookup = {};
    VALIDATION_PARAMETERS.forEach((parameter) => {
      const normalized = normalizeKey(parameter);
      // Build candidates list for details lookup (matching score lookup logic)
      const detailsCandidates = [
        parameter,
        normalized,
        normalized.replace(/_/g, ""),
        parameter.toLowerCase(),
      ];
      
      // Handle Team / Founder Fit variations for details
      if (parameter === "Team / Founder Fit") {
        detailsCandidates.push("team_founder_fit", "team_fit", "founder_fit");
      }
      
      // Try each candidate to find the details
      let detailsKey = null;
      for (const candidate of detailsCandidates) {
        if (detailsMap[candidate] !== undefined) {
          detailsKey = detailsMap[candidate];
          break;
        }
      }

      lookup[parameter] = {
        score: getScoreFromScores(scores, parameter),
        details: detailsKey,
      };
    });
    return lookup;
  }, [scores, validation?.details]);

  // Build radar data
  const radarData = useMemo(
    () =>
      RADAR_AXES.map((axis) => ({
        label: axis.label,
        value: parameterLookup[axis.parameter]?.score ?? 0,
      })),
    [parameterLookup]
  );

  // Build parameter groups
  const parameterGroups = useMemo(() => {
    return PARAMETER_GROUPS_LAYOUT.map((group) => {
      const cards = group.parameters
        .map((name, index) => {
          const data = parameterLookup[name] || { score: 0, details: null };
          return {
            name,
            score: data.score ?? 0,
            details: data.details,
            order: index,
          };
        })
        .filter((item) => (viewFilter === "red" ? item.score <= 3 : true));

      const sortedCards = [...cards];
      if (sortOption === "score-asc") {
        sortedCards.sort((a, b) => a.score - b.score);
      } else if (sortOption === "score-desc") {
        sortedCards.sort((a, b) => b.score - a.score);
      } else {
        sortedCards.sort((a, b) => a.order - b.order);
      }

      return { ...group, cards: sortedCards };
    }).filter((group) => group.cards.length > 0);
  }, [parameterLookup, viewFilter, sortOption]);

  return {
    scores,
    overallScore,
    recommendations,
    nextSteps,
    parameterLookup,
    radarData,
    parameterGroups,
  };
}

