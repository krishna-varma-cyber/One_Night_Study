import React from 'react';
import { ArrowLeft, BookOpen, Lightbulb, RefreshCw } from 'lucide-react';
import { ExamKitData, TopicItem } from '../types';
import { DiagramCanvas } from './DiagramCanvas';

interface ExamKitViewProps {
  topic: TopicItem;
  kit?: ExamKitData;
  isLoading: boolean;
  error?: string;
  onBackToOverview: () => void;
  onRegenerate: () => void;
}

export const ExamKitView: React.FC<ExamKitViewProps> = ({
  topic,
  kit,
  isLoading,
  error,
  onBackToOverview,
  onRegenerate,
}) => {
  return (
    <section className="space-y-5" aria-labelledby="exam-kit-title">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToOverview}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-sm font-medium text-zinc-200 inline-flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Roadmap &amp; Blueprint</span>
        </button>

        <button
          type="button"
          onClick={onRegenerate}
          disabled={isLoading}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-sm font-medium text-zinc-200 inline-flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Generating Kit...' : 'Regenerate Kit'}</span>
        </button>
      </div>

      {/* Title Card */}
      <div className="rounded-2xl bg-[#16171B] border border-white/[0.08] p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span>{topic.unit}</span>
          <span aria-hidden="true">·</span>
          <span>{topic.priority} Priority</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">~{topic.estimatedMinutes} mins prep</span>
        </div>
        <h2 id="exam-kit-title" className="text-2xl font-semibold text-zinc-100 mt-1">
          {topic.name} — Exam Kit
        </h2>
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-[#16171B] border border-white/[0.08] p-6 space-y-4">
          <div className="flex items-center gap-3 text-sm text-blue-300">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Building your 5-min explanation, 2M/5M/10M answers, and exam diagram...</span>
          </div>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-white/[0.07] rounded w-3/4" />
            <div className="h-4 bg-white/[0.05] rounded w-full" />
            <div className="h-4 bg-white/[0.05] rounded w-5/6" />
            <div className="h-36 bg-white/[0.04] rounded-xl w-full mt-4" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/25 p-5 space-y-3">
          <p className="text-sm text-red-200">{error}</p>
          <button
            type="button"
            onClick={onRegenerate}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-sm font-medium text-red-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : kit ? (
        <div className="space-y-5">
          {/* 1. Understand in 5 mins */}
          <div className="rounded-2xl bg-[#16171B] border border-white/[0.08] p-5 md:p-6 space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
              <BookOpen className="w-4 h-4" />
              <h3 className="text-base font-semibold text-zinc-100">Understand in 5 mins</h3>
            </div>
            <p className="text-[15px] leading-relaxed text-zinc-200 whitespace-pre-line">
              {kit.understandIn5Mins}
            </p>
          </div>

          {/* 2. 2-Mark Answer */}
          <div className="rounded-2xl bg-[#16171B] border border-white/[0.08] p-5 md:p-6 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-zinc-100">2-Mark Answer</h3>
              <span className="text-xs text-zinc-400">3 crisp lines</span>
            </div>
            <ul className="space-y-2 text-[15px] leading-relaxed text-zinc-200 list-disc pl-5">
              {kit.twoMarkAnswer.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          {/* 3. 5-Mark Answer */}
          <div className="rounded-2xl bg-[#16171B] border border-white/[0.08] p-5 md:p-6 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-zinc-100">5-Mark Answer</h3>
              <span className="text-xs text-zinc-400">10 exam lines</span>
            </div>
            <ol className="space-y-2 text-[15px] leading-relaxed text-zinc-200 list-decimal pl-5">
              {kit.fiveMarkAnswer.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </div>

          {/* 4. 10-Mark Answer */}
          <div className="rounded-2xl bg-[#16171B] border border-white/[0.08] p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-zinc-100">10-Mark Answer</h3>
              <span className="text-xs text-zinc-400">Intro + Steps + Conclusion</span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Introduction
              </h4>
              <p className="text-[15px] leading-relaxed text-zinc-200">
                {kit.tenMarkAnswer.intro}
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Working &amp; Key Steps
              </h4>
              <div className="space-y-3">
                {kit.tenMarkAnswer.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-[#111216] border border-white/[0.06] p-4 space-y-1.5"
                  >
                    <p className="text-sm font-semibold text-zinc-100 tabular-nums">
                      {idx + 1}. {step.heading}
                    </p>
                    <p className="text-sm leading-relaxed text-zinc-300">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Conclusion
              </h4>
              <p className="text-[15px] leading-relaxed text-zinc-200">
                {kit.tenMarkAnswer.conclusion}
              </p>
            </div>
          </div>

          {/* 5. Diagram to Draw + Real Life Example */}
          <div className="rounded-2xl bg-[#16171B] border border-white/[0.08] p-5 md:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-zinc-100">
                One Diagram to Draw + One Real Life Example
              </h3>
              <span className="text-xs text-emerald-400">Saved to Media</span>
            </div>

            <DiagramCanvas diagram={kit.diagram} />

            <div className="rounded-xl bg-[#111216] border border-white/[0.07] p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-300">
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span className="text-sm font-semibold">
                  Real Life Example · {kit.realLifeExample.contextTag}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-300">
                {kit.realLifeExample.explanation}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
