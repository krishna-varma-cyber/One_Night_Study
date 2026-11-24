import React from 'react';
import { ArrowUpRight, Clock, Flag, Layers, ShieldCheck } from 'lucide-react';
import { RoadmapData, TopicItem } from '../types';

interface RoadmapCardProps {
  subjectName: string;
  roadmap: RoadmapData;
  topics: TopicItem[];
  onSelectTopic: (topicId: string) => void;
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({
  subjectName,
  roadmap,
  topics,
  onSelectTopic,
}) => {
  const findTopicIdByName = (name: string): string | undefined => {
    const lower = name.toLowerCase().trim();
    return topics.find(
      (t) =>
        t.name.toLowerCase().trim() === lower ||
        t.name.toLowerCase().includes(lower) ||
        lower.includes(t.name.toLowerCase())
    )?.id;
  };

  const renderPriorityGroup = (
    label: string,
    items: string[],
    badgeClass: string
  ) => (
    <div className="rounded-xl bg-[#111216] border border-white/[0.07] p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${badgeClass}`}>{label}</span>
        <span className="text-xs text-zinc-400 tabular-nums">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-zinc-500">None assigned</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, idx) => {
            const topicId = findTopicIdByName(item);
            return (
              <li key={`${label}-${idx}`}>
                {topicId ? (
                  <button
                    type="button"
                    onClick={() => onSelectTopic(topicId)}
                    className="w-full text-left text-sm text-zinc-200 hover:text-blue-300 flex items-center justify-between gap-2 py-1 transition-colors group"
                  >
                    <span className="truncate">{item}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400 shrink-0" />
                  </button>
                ) : (
                  <span className="block text-sm text-zinc-300 py-1 truncate">{item}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <section
      className="rounded-2xl bg-[#16171B] border border-white/[0.08] p-5 md:p-6 space-y-6"
      aria-labelledby="roadmap-heading"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.07]">
        <div>
          <p className="text-xs text-zinc-400">{subjectName}</p>
          <h2 id="roadmap-heading" className="text-xl font-semibold text-zinc-100 mt-0.5">
            Your 1-Night Roadmap
          </h2>
        </div>

        <div className="flex items-center gap-4 text-sm text-zinc-300 tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-zinc-400" />
            <span>Total Topics: {roadmap.totalTopics}</span>
          </span>
          <span aria-hidden="true" className="text-zinc-600">
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Total Time: {roadmap.totalTime}</span>
          </span>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
          <Flag className="w-3.5 h-3.5" />
          <span>Priority Split — click any topic to open its Exam Kit</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {renderPriorityGroup('High Priority', roadmap.highPriority, 'text-rose-400')}
          {renderPriorityGroup('Medium Priority', roadmap.mediumPriority, 'text-amber-400')}
          {renderPriorityGroup('Low Priority', roadmap.lowPriority, 'text-emerald-400')}
        </div>
      </div>

      {/* 8-Hour Timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-200">8-Hour Timeline</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roadmap.timeline.map((block, idx) => (
            <div
              key={`${block.window}-${idx}`}
              className="rounded-xl bg-[#111216] border border-white/[0.07] p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-semibold text-blue-400 tabular-nums">
                  {block.window}
                </span>
                <span className="text-xs text-zinc-400 truncate">{block.focus}</span>
              </div>
              {block.topics.length > 0 ? (
                <p className="text-sm font-medium text-zinc-100 leading-snug">
                  {block.topics.join(', ')}
                </p>
              ) : null}
              <p className="text-xs text-zinc-400 leading-relaxed">{block.strategy}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pass Line */}
      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <p className="text-sm font-medium text-emerald-200">{roadmap.passLine}</p>
      </div>
    </section>
  );
};
