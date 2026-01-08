import Celebration, { getCelebrationMessage } from "../../../components/common/Celebration.jsx";
import RadarChart from "../../../components/validation/RadarChart.jsx";
import ParameterScores from "../../../components/validation/ParameterScores.jsx";
import ScoreLegend from "../../../components/validation/ScoreLegend.jsx";
import ParameterCard from "../../../components/validation/ParameterCard.jsx";
import { getScoreMeta } from "../utils.js";
import UIHeading from "../../../components/ui/ui-heading.jsx";

export default function ResultsTab({
  overallScore,
  showCelebration,
  previousScore,
  overallStatus,
  radarData,
  parameterGroups,
  parameterLookup,
  viewFilter,
  setViewFilter,
  sortOption,
  setSortOption,
  setActiveTab,
  downloadButtonRef,
}) {
  return (
    <div className="space-y-6">
      {/* Celebration Banner for High Scores */}
      {overallScore >= 8 && (
        <div className="relative overflow-hidden rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
          <Celebration score={overallScore} show={showCelebration} />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-2xl">
              {getCelebrationMessage(overallScore).emoji}
            </div>
            <div className="flex-1">
              <UIHeading level="h3" className="text-primary">
                {getCelebrationMessage(overallScore).message}
              </UIHeading>
              <p className="mt-1 text-sm text-secondary">
                Your idea scored {overallScore.toFixed(1)}/10 - That's impressive! 🎉
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Re-Validation Comparison Banner */}
      {previousScore !== null && previousScore !== undefined && (
        <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
          <UIHeading level="h2" className="text-primary flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-xl">📈</div>
            Improvement Comparison
          </UIHeading>
          <div className="flex items-center gap-4">
            <div className="flex-1 rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
              <div className="text-xs text-secondary mb-1">Previous Score</div>
              <div className="text-3xl font-bold text-primary">{previousScore.toFixed(1)}</div>
              <div className="text-xs text-secondary">/ 10</div>
            </div>
            <div className="text-2xl font-bold text-secondary">→</div>
            <div className="flex-1 rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
              <div className="text-xs text-secondary mb-1">New Score</div>
              <div className="text-3xl font-bold text-primary">{overallScore.toFixed(1)}</div>
              <div className="text-xs text-secondary">/ 10</div>
            </div>
            <div className="flex-1 rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
              <div className="text-xs text-secondary mb-1">Change</div>
              <div className={`text-3xl font-bold ${overallScore > previousScore ? 'text-primary' : overallScore < previousScore ? 'text-primary' : 'text-primary'}`}>
                {overallScore > previousScore ? '+' : ''}{(overallScore - previousScore).toFixed(1)}
              </div>
              <div className="text-xs text-secondary">
                {overallScore > previousScore ? 'Improved!' : overallScore < previousScore ? 'Decreased' : 'No change'}
              </div>
            </div>
          </div>
          {overallScore > previousScore && (
            <p className="mt-4 text-sm text-secondary">
              🎉 Great job! Your idea improved by {((overallScore - previousScore) / previousScore * 100).toFixed(0)}%. Keep refining!
            </p>
          )}
        </div>
      )}

      {/* Diagnostic Layout */}
      <div className="space-y-4">
        {/* Overall Score + Score Legend */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 mb-1.5">
          {/* Small Score Card - Left Side */}
          <div className="lg:w-48 flex-shrink-0">
            <div className="rounded-xl border border-default shadow-lg bg-gradient-to-br from-surface to-surface-muted p-6 md:p-7 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 opacity-10" style={{
                background: overallScore >= 7 ? 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' :
                           overallScore >= 4 ? 'radial-gradient(circle, var(--warning) 0%, transparent 70%)' :
                           'radial-gradient(circle, var(--coral-500) 0%, transparent 70%)'
              }}></div>
              <p className="text-xs text-secondary mb-2 relative z-10">Overall Score</p>
              <div className="text-center relative z-10">
                <div className="flex items-baseline justify-center gap-1">
                  <p className="text-4xl font-bold" style={{
                    color: overallScore >= 7 ? 'var(--accent)' :
                           overallScore >= 4 ? 'var(--warning)' :
                           'var(--coral-500)'
                  }}>{overallScore.toFixed(1)}</p>
                  <p className="text-lg text-secondary">/10</p>
                </div>
                <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium shadow-sm ${overallStatus.badge}`}>
                  {overallStatus.label}
                </div>
              </div>
            </div>
          </div>

          {/* Score Legend - Right Side */}
          <div className="lg:w-56 flex-shrink-0">
            <ScoreLegend />
          </div>
        </div>

        {/* Diagnostic Overview - Unified Analytics Block */}
        <UIHeading level="h3" className="text-primary mb-3">Diagnostic Overview Across 10 Validation Pillars</UIHeading>
        <div className="mb-3 rounded-xl border border-default shadow-lg bg-gradient-to-br from-surface to-surface-muted p-6 md:p-7">
          <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-stretch min-h-[340px]">
            {/* Column 1: Radar Chart (50%) */}
            <div className="lg:w-[50%] flex flex-col lg:justify-center lg:pr-4">
              <RadarChart axes={radarData} />
            </div>

            {/* Column 2: Parameter Scores (50%) */}
            <div className="lg:w-[50%] flex flex-col lg:justify-center lg:border-l lg:border-default lg:pl-4">
              <ParameterScores 
                parameterCards={parameterGroups.flatMap(g => g.cards)} 
                parameterLookup={parameterLookup} 
              />
            </div>
          </div>
        </div>

        {/* Filter / Sort Row */}
        <p className="mb-2 text-sm text-secondary">View parameter-by-parameter breakdown and insights.</p>
        <div className="flex flex-col gap-4 rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <p className="text-xs text-secondary">View</p>
            <div className="mt-2 inline-flex overflow-hidden rounded-full border border-default">
              <button
                type="button"
                onClick={() => setViewFilter("all")}
                className={`px-4 py-2 text-sm font-medium transition focus-visible:outline-accent ${
                  viewFilter === "all"
                    ? "bg-surface-muted text-primary"
                    : "text-secondary hover:text-accent-hover"
                }`}
              >
                All Parameters
              </button>
              <button
                type="button"
                onClick={() => setViewFilter("red")}
                className={`px-4 py-2 text-sm font-medium transition focus-visible:outline-accent ${
                  viewFilter === "red"
                    ? "bg-surface-muted text-primary"
                    : "text-secondary hover:text-accent-hover"
                }`}
              >
                Red Flags Only
              </button>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <label className="text-xs text-secondary">Sort by</label>
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
              className="mt-2 w-full ui-select text-sm focus-visible:outline-accent md:w-56"
            >
              <option value="category">Category Order</option>
              <option value="score-asc">Score: Low → High</option>
              <option value="score-desc">Score: High → Low</option>
            </select>
          </div>
        </div>

        {/* Parameter Groups */}
        <div className="space-y-10 md:space-y-12">
          {parameterGroups.length > 0 ? (
            parameterGroups.map((group) => (
              <div key={group.id}>
                <div className="mb-6">
                  <UIHeading level="h3" className="text-primary flex items-center gap-2">{group.title}</UIHeading>
                  <p className="text-sm text-secondary">{group.description}</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {group.cards.map((card) => (
                    <ParameterCard
                      key={card.name}
                      parameter={card.name}
                      score={card.score}
                      details={card.details}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center">
              <p className="text-lg font-semibold text-primary mb-1">No parameters match the selected filter.</p>
              <p className="text-secondary leading-relaxed max-w-md mx-auto">Try adjusting your filter to see more results.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Nav */}
      <div className="flex flex-col gap-4 rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">This page shows your diagnostic scores only.</p>
          <p className="text-sm text-secondary">
            To explore next steps and recommendations, go to the relevant sections.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("analysis")}
            className="px-5 py-2.5 rounded-lg font-medium text-accent bg-surface hover:bg-surface transition-all shadow-sm hover:shadow-md"
          >
            Recommendations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("nextsteps")}
            className="px-5 py-2.5 rounded-lg font-medium text-accent bg-surface hover:bg-surface transition-all shadow-sm hover:shadow-md"
          >
            Action Plan
          </button>
          <button
            type="button"
            onClick={() => downloadButtonRef.current?.click()}
            className="ui-btn ui-btn-primary focus-visible:outline-accent"
          >
            Download Full Report
          </button>
        </div>
      </div>
    </div>
  );
}

