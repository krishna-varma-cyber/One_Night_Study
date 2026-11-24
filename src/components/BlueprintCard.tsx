import React from 'react';
import { BlueprintUnit } from '../types';

interface BlueprintCardProps {
  blueprint: BlueprintUnit[];
}

export const BlueprintCard: React.FC<BlueprintCardProps> = ({ blueprint }) => {
  const totalMarks = blueprint.reduce((sum, u) => sum + (u.expectedMarks || 0), 0) || 1;
  const maxUnitMarks = Math.max(...blueprint.map((u) => u.expectedMarks || 0), 1);

  return (
    <section
      className="rounded-2xl bg-[#16171B] border border-white/[0.08] p-5 md:p-6 space-y-5"
      aria-labelledby="blueprint-heading"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.07]">
        <h2 id="blueprint-heading" className="text-xl font-semibold text-zinc-100">
          Exam Blueprint
        </h2>
        <span className="text-sm text-zinc-400 tabular-nums">
          Total Mapped Weightage: {totalMarks} Marks
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-left border-collapse min-w-[540px]">
          <thead>
            <tr className="border-b border-white/[0.08] text-xs font-medium text-zinc-400">
              <th className="py-2.5 pr-4">Unit</th>
              <th className="py-2.5 pr-4">Topics</th>
              <th className="py-2.5 pr-4 text-right tabular-nums">Expected Marks</th>
              <th className="py-2.5 pl-4">Question Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-sm">
            {blueprint.map((row, idx) => (
              <tr key={`${row.unit}-${idx}`} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 pr-4 font-medium text-zinc-100 whitespace-nowrap align-top">
                  {row.unit}
                </td>
                <td className="py-3 pr-4 text-zinc-300 align-top">
                  {row.topics.join(', ')}
                </td>
                <td className="py-3 pr-4 text-right font-mono font-medium text-blue-300 tabular-nums align-top whitespace-nowrap">
                  {row.expectedMarks}
                </td>
                <td className="py-3 pl-4 text-zinc-300 align-top whitespace-nowrap">
                  {row.questionTypes.join(' · ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Marks Distribution Bars */}
      <div className="pt-2 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-200">Marks Distribution</h3>
        <div className="space-y-2.5">
          {blueprint.map((row, idx) => {
            const pctOfTotal = Math.round((row.expectedMarks / totalMarks) * 100);
            const barWidth = Math.max(8, Math.round((row.expectedMarks / maxUnitMarks) * 100));
            return (
              <div key={`bar-${row.unit}-${idx}`} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium truncate pr-4">{row.unit}</span>
                  <span className="text-zinc-400 font-mono tabular-nums shrink-0">
                    {row.expectedMarks} marks ({pctOfTotal}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#0D0E11] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
