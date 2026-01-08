import { useMemo } from "react";
import { parseStructuredIdeas } from "../../utils/parsers/index.js";

/**
 * Hook for filtering and sorting runs, validations, and search results
 */
export function useFiltering({
  allRunsMerged,
  allValidations,
  allIdeas,
  sortBy,
  dateFilter,
  scoreFilter,
  advancedSearch,
  searchTabQuery,
  searchCategory
}) {
  const filteredRuns = useMemo(() => {
    if (!allRunsMerged || allRunsMerged.length === 0) return [];
    
    const discoveryRuns = allRunsMerged.filter(run => {
      if (run.is_validation === true) return false;
      if (run.validation_id) return false;
      if (run.overall_score !== undefined && run.overall_score !== null) return false;
      return true;
    });
    
    let sorted = [...discoveryRuns];
    
    if (sortBy === "date") {
      sorted.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } else if (sortBy === "date_oldest") {
      sorted.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    }
    
    return sorted;
  }, [allRunsMerged, sortBy]);

  const filteredValidations = useMemo(() => {
    if (!allValidations || allValidations.length === 0) return [];

    let filtered = [...allValidations];

    // Date filter
    if (dateFilter !== "all") {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const oneWeek = 7 * oneDay;
      const oneMonth = 30 * oneDay;

      filtered = filtered.filter(v => {
        const timestamp = v.timestamp || 0;
        const age = now - timestamp;

        switch (dateFilter) {
          case "today":
            return age < oneDay;
          case "week":
            return age < oneWeek;
          case "month":
            return age < oneMonth;
          default:
            return true;
        }
      });
    }

    // Score filter
    if (scoreFilter !== "all") {
      filtered = filtered.filter(v => {
        const score = v.overall_score;
        if (score === undefined || score === null) return false;

        switch (scoreFilter) {
          case "high":
            return score >= 7;
          case "medium":
            return score >= 4 && score < 7;
          case "low":
            return score < 4;
          default:
            return true;
        }
      });
    }

    // Advanced search filter
    if (advancedSearch && advancedSearch.searchType === "validations") {
      const query = (advancedSearch.ideaDescription || "").toLowerCase().trim();
      if (query) {
        filtered = filtered.filter(v => {
          const explanation = (v.idea_explanation || "").toLowerCase();
          return explanation.includes(query);
        });
      }
    }

    // Sort
    let sorted = [...filtered];
    if (sortBy === "date") {
      sorted.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } else if (sortBy === "date_oldest") {
      sorted.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    } else if (sortBy === "score_high") {
      sorted.sort((a, b) => {
        const scoreA = a.overall_score ?? -1;
        const scoreB = b.overall_score ?? -1;
        return scoreB - scoreA;
      });
    } else if (sortBy === "score_low") {
      sorted.sort((a, b) => {
        const scoreA = a.overall_score ?? 999;
        const scoreB = b.overall_score ?? 999;
        return scoreA - scoreB;
      });
    }

    return sorted;
  }, [
    allValidations,
    dateFilter,
    scoreFilter,
    sortBy,
    advancedSearch
  ]);

  const filteredSearchIdeas = useMemo(() => {
    if (!searchTabQuery.trim()) return [];

    const query = searchTabQuery.toLowerCase().trim();
    const results = [];

    allIdeas.forEach(idea => {
      let matches = false;

      let fullIdeaData = { ...idea };
      if (idea.runReports?.personalized_recommendations) {
        const recs = idea.runReports.personalized_recommendations;
        const parsed = parseStructuredIdeas(typeof recs === 'string' ? recs : '', 10);
        const matchedIdea = parsed.find(p => String(p.index) === String(idea.ideaIndex));
        if (matchedIdea) {
          const body = matchedIdea.body || matchedIdea.fullText || '';
          const timelineMatch = body.match(/(?:timeline|timeline_effort)[:\-]?\s*(.+?)(?:\n|$)/i);
          const whyFitsMatch = body.match(/(?:why_this_fits|why.*fits)[:\-]?\s*(.+?)(?:\n|$)/i);
          
          fullIdeaData = {
            ...fullIdeaData,
            target_market: matchedIdea.target_market || '',
            revenue_model: matchedIdea.revenue_model || '',
            timeline: timelineMatch ? timelineMatch[1].trim() : '',
            why_this_fits: whyFitsMatch ? whyFitsMatch[1].trim() : (matchedIdea.summary || '')
          };
        }
      }

      // Search based on category
      if (searchCategory === "all" || searchCategory === "title") {
        if (fullIdeaData.title?.toLowerCase().includes(query)) matches = true;
      }
      if (searchCategory === "all" || searchCategory === "summary") {
        if (fullIdeaData.summary?.toLowerCase().includes(query)) matches = true;
      }
      if (searchCategory === "all" || searchCategory === "market") {
        if (fullIdeaData.target_market?.toLowerCase().includes(query)) matches = true;
      }
      if (searchCategory === "all" || searchCategory === "revenue") {
        if (fullIdeaData.revenue_model?.toLowerCase().includes(query)) matches = true;
      }
      if (searchCategory === "all" || searchCategory === "timeline") {
        if (fullIdeaData.timeline?.toLowerCase().includes(query)) matches = true;
      }
      if (searchCategory === "all" || searchCategory === "why_fits") {
        if (fullIdeaData.why_this_fits?.toLowerCase().includes(query)) matches = true;
      }

      if (matches) {
        results.push(fullIdeaData);
      }
    });

    return results;
  }, [allIdeas, searchTabQuery, searchCategory]);

  return {
    filteredRuns,
    filteredValidations,
    filteredSearchIdeas
  };
}

