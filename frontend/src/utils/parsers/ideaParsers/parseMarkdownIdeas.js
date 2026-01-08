/**
 * Parse markdown IDEA patterns (PRIORITY 3-7)
 * Handles various fallback markdown patterns for extracting ideas
 */

import { generateUUID } from '../helpers/uuidHelpers.js';
import { filterUniqueIdeas, renumberIndices } from './ideaHelpers.js';
import { shouldExcludeTitle, cleanSummaryText } from './ideaPatterns.js';

/**
 * Try to find ideas using various markdown patterns (PRIORITY 3-7)
 * @param {string} text - Text to parse
 * @param {number} limit - Maximum number of ideas to return
 * @returns {Array} Array of parsed ideas
 */
export function parseMarkdownIdeas(text = "", limit = null) {
  if (!text) return [];

  const ideas = [];
  let matches = [];

  // PRIORITY 3: Try numbered lists with various formats
  let headingRegex = /(?:^|\n)(?:###\s*)?(\d+)\.\s*(?:\*\*(.+?)\*\*|([^\n]+))/g;
  matches = [...text.matchAll(headingRegex)];

  // Pattern 1a: More flexible - allow for extra spaces or formatting
  if (matches.length === 0) {
    headingRegex = /(?:^|\n)(?:###\s*)?(\d+)\.\s+\*\*([^*]+?)\*\*/g;
    matches = [...text.matchAll(headingRegex)];
  }

  // Pattern 1b: Also try with em dash or other separators
  if (matches.length === 0) {
    headingRegex = /(?:^|\n)(?:###\s*)?(\d+)\.\s*[-–]\s*(?:\*\*(.+?)\*\*|([^\n]+))/g;
    matches = [...text.matchAll(headingRegex)];
  }

  // Pattern 1c: Try with colon
  if (matches.length === 0) {
    headingRegex = /(?:^|\n)(?:###\s*)?(\d+)\.\s*(?:\*\*(.+?)\*\*:|([^:\n]+):)/g;
    matches = [...text.matchAll(headingRegex)];
  }

  // Pattern 2: If no matches, try just numbered: "1. Idea Name" (without bold)
  if (matches.length === 0) {
    headingRegex = /(?:^|\n)(?:###\s*)?(\d+)\.\s+([^\n]+)/g;
    matches = [...text.matchAll(headingRegex)];
  }

  // Pattern 2b: Try numbered with dash
  if (matches.length === 0) {
    headingRegex = /(?:^|\n)(?:###\s*)?(\d+)\.\s*[-–]\s+([^\n]+)/g;
    matches = [...text.matchAll(headingRegex)];
  }

  // Pattern 3: Try markdown headers: "### Idea Name" or "## Idea Name"
  if (matches.length === 0) {
    headingRegex = /(?:^|\n)(#{2,3})\s+([^\n]+)/g;
    const headerMatches = [...text.matchAll(headingRegex)];
    // Filter out common non-idea headers
    const filteredHeaders = headerMatches.filter(match => {
      const title = match[2].toLowerCase().trim();
      return !shouldExcludeTitle(title);
    });
    // Assign sequential numbers to header-based matches
    matches = filteredHeaders.map((match, idx) => {
      const newMatch = [...match];
      newMatch[1] = String(idx + 1);
      newMatch[2] = match[2];
      newMatch.index = match.index;
      return newMatch;
    });
  }

  // Pattern 4: Try finding any bold text that looks like a title
  if (matches.length === 0) {
    headingRegex = /(?:^|\n)\*\*([^*]+?)\*\*/g;
    const boldMatches = [...text.matchAll(headingRegex)];
    matches = boldMatches
      .filter(match => {
        const title = match[1].trim();
        const titleLower = title.toLowerCase();
        return title.length < 100 && 
               title.length > 3 && 
               !title.match(/^(and|or|the|a|an)\s/i) &&
               !shouldExcludeTitle(titleLower);
      })
      .slice(0, limit || 10)
      .map((match, idx) => {
        const newMatch = [...match];
        newMatch[1] = String(idx + 1);
        newMatch[2] = match[1];
        newMatch.index = match.index;
        return newMatch;
      });
  }

  // Pattern 5: Try to find any lines that look like idea titles
  if (matches.length === 0) {
    const lines = text.split(/\n/);
    const potentialTitles = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (
        line.length >= 10 &&
        line.length <= 80 &&
        /^[A-Z]/.test(line) &&
        !line.match(/^(#{1,6}|[-*+]|\d+\.)\s/) &&
        !line.match(/^(The|This|That|These|Those|And|Or|But)\s/i) &&
        lines[i + 1] && lines[i + 1].trim().length > 20
      ) {
        potentialTitles.push({
          index: i,
          title: line,
          matchIndex: text.indexOf(line),
        });
      }
    }

    if (potentialTitles.length > 0) {
      matches = potentialTitles.slice(0, limit || 10).map((item, idx) => {
        const newMatch = [];
        newMatch[1] = String(idx + 1);
        newMatch[2] = item.title;
        newMatch.index = item.matchIndex;
        return newMatch;
      });
    }
  }

  // Pattern 6: Last resort - split by major sections
  if (matches.length === 0 && text.length > 200) {
    const sections = text.split(/\n\s*\n\s*\n/).filter(s => {
      const trimmed = s.trim();
      if (trimmed.length < 50) return false;
      const lower = trimmed.toLowerCase();
      return !shouldExcludeTitle(lower);
    });
    if (sections.length >= 2) {
      matches = sections.slice(0, limit || 10).map((section, idx) => {
        const firstLine = section.split('\n')[0].trim();
        const firstFewLines = section.split('\n').slice(0, 3).join(' ');
        const boldMatch = firstFewLines.match(/\*\*([^*]+?)\*\*/);
        const numberedMatch = firstFewLines.match(/(\d+)\.\s+([^\n]+)/);
        
        let title = `Idea ${idx + 1}`;
        if (boldMatch && boldMatch[1].trim().length < 80 && boldMatch[1].trim().length > 5) {
          title = boldMatch[1].trim();
        } else if (numberedMatch && numberedMatch[2].trim().length < 80) {
          title = numberedMatch[2].trim();
        } else if (firstLine.length < 80 && firstLine.length > 10) {
          title = firstLine.replace(/^[#*\-]\s*/, '').substring(0, 60);
        }
        
        const newMatch = [];
        newMatch[1] = String(idx + 1);
        newMatch[2] = title;
        newMatch.index = text.indexOf(section);
        return newMatch;
      });
    }
  }

  // Pattern 7: Very last resort - look for substantial paragraphs
  if (matches.length === 0 && text.length > 300) {
    const paragraphs = text.split(/\n\s*\n/).filter(p => {
      const trimmed = p.trim();
      return trimmed.length > 100 && 
             trimmed.length < 2000 &&
             !trimmed.match(/^(#{1,6}|###|##)\s+(recommendation|financial|risk|customer|validation|roadmap|decision)/i);
    });

    if (paragraphs.length >= 2) {
      matches = paragraphs.slice(0, limit || 10).map((para, idx) => {
        const firstSentence = para.match(/^([^.!?]+[.!?])/);
        const title = firstSentence 
          ? firstSentence[1].trim().substring(0, 60)
          : para.trim().substring(0, 60).replace(/\n/g, ' ');

        const newMatch = [];
        newMatch[1] = String(idx + 1);
        newMatch[2] = title;
        newMatch.index = text.indexOf(para);
        return newMatch;
      });
    }
  }

  // Process matches into ideas
  const maxIdeas = limit || matches.length;
  for (let i = 0; i < matches.length && ideas.length < maxIdeas; i += 1) {
    const match = matches[i];
    const index = parseInt(match[1], 10) || i + 1;
    const rawTitle = (match[2] || match[3] || "").trim();

    if (!rawTitle) continue;

    const nextMatchIndex = i + 1 < matches.length && matches[i + 1].index !== undefined 
      ? matches[i + 1].index 
      : text.length;
    const start = match.index !== undefined ? match.index + match[0].length : 0;
    const body = text.slice(start, nextMatchIndex).trim();
    const summaryMatch = body.replace(/\s+/g, " ").match(/([^.!?]+[.!?])/);
    let summary = summaryMatch ? summaryMatch[0].trim() : rawTitle;

    // Clean summary text
    summary = cleanSummaryText(summary);

    ideas.push({
      id: generateUUID(),
      index,
      title: rawTitle.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim(),
      body: body || summary,
      summary: summary || rawTitle,
      fullText: text.slice(match.index ?? 0, nextMatchIndex).trim(),
    });
  }

  // If still no ideas found, try one more aggressive approach
  if (ideas.length === 0 && text.length > 100) {
    const numberedItems = text.matchAll(/(?:^|\n)(\d+)\.\s+([^\n]+)/g);
    const potentialIdeas = [];
    for (const match of numberedItems) {
      const num = parseInt(match[1], 10);
      const textItem = match[2].trim();
      if (textItem.length < 10 || 
          textItem.length > 200 ||
          textItem.toLowerCase().match(/^(recommendation|financial|risk|customer|validation|roadmap|decision|profile|matrix)/i)) {
        continue;
      }
      const title = textItem.replace(/\*\*/g, '').split(/[:\-–]/)[0].trim();
      if (title.length >= 5 && title.length <= 100) {
        potentialIdeas.push({
          index: num,
          title: title,
          matchIndex: match.index,
          fullMatch: match[0]
        });
      }
    }

    if (potentialIdeas.length >= 2) {
      for (let i = 0; i < Math.min(potentialIdeas.length, limit || 10); i++) {
        const item = potentialIdeas[i];
        const nextItem = potentialIdeas[i + 1];
        const start = item.matchIndex + item.fullMatch.length;
        const end = nextItem ? nextItem.matchIndex : text.length;
        const body = text.slice(start, end).trim();

        let cleanSummary = body.split(/[.!?]/)[0] || item.title;
        cleanSummary = cleanSummaryText(cleanSummary);

        ideas.push({
          id: generateUUID(),
          index: item.index,
          title: item.title,
          body: body || item.title,
          summary: cleanSummary || item.title,
          fullText: text.slice(item.matchIndex, end).trim(),
        });
      }
    }
  }

  // Apply uniqueness filter and return
  const uniqueIdeas = filterUniqueIdeas(ideas);
  renumberIndices(uniqueIdeas);

  if (process.env.NODE_ENV === 'development' && uniqueIdeas.length === 0) {
    console.log('[parseMarkdownIdeas] No ideas found. Text length:', text.length);
    console.log('[parseMarkdownIdeas] First 1000 chars:', text.substring(0, 1000));
  }

  return uniqueIdeas;
}

