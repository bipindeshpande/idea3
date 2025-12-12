import { Link } from "react-router-dom";

export default function GettingStarted({ onDismiss }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          How Startup Idea Advisor Works
        </h2>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
          Get personalized startup recommendations and validation analysis tailored to your situation.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-400 font-semibold">
            1
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-50">Discover startup ideas</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Get ideas tailored to your time, budget, and skills. Each recommendation includes market research, financial outlook, and execution steps.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-400 font-semibold">
            2
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-50">Validate an idea you already have</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Test your startup idea with advisor-grade analysis including market validation, risk assessment, and go/no-go recommendations.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-400 font-semibold">
            3
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-50">Re-run anytime</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              As your focus or constraints change, run discovery again to get fresh recommendations that match your current situation.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Link
          to="/advisor#intake-form"
          onClick={onDismiss}
          className="flex-1 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-200 hover:from-brand-600 hover:to-brand-700 hover:shadow-xl hover:shadow-brand-500/30 text-center"
        >
          Discover Ideas
        </Link>
        <Link
          to="/validate-idea"
          onClick={onDismiss}
          className="flex-1 rounded-xl border border-brand-300/60 dark:border-brand-700/60 bg-white dark:bg-slate-800 px-5 py-3 text-sm font-semibold text-brand-700 dark:text-brand-300 shadow-sm transition-all duration-200 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-center"
        >
          Validate Idea
        </Link>
      </div>
    </div>
  );
}

