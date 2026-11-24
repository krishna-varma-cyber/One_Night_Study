import React from 'react';
import { ArrowLeft, Image as ImageIcon, Trash2 } from 'lucide-react';
import { MediaDiagramItem } from '../types';
import { DiagramCanvas } from './DiagramCanvas';

interface MediaGalleryProps {
  items: MediaDiagramItem[];
  onBackToPlanner: () => void;
  onDeleteItem: (id: string) => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  onBackToPlanner,
  onDeleteItem,
}) => {
  return (
    <section className="space-y-5" aria-labelledby="media-gallery-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="media-gallery-title" className="text-xl font-semibold text-zinc-100">
            Media
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Saved generated diagrams and flowcharts
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToPlanner}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-sm font-medium text-zinc-200 inline-flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-[#16171B] border border-white/[0.08] py-16 px-6 text-center space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto">
            <ImageIcon className="w-5 h-5 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-300">No saved diagrams yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-[#16171B] border border-white/[0.08] p-5 space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-zinc-400 truncate">{item.subjectName}</p>
                  <h3 className="text-base font-semibold text-zinc-100 truncate">
                    {item.topicName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-300 hover:bg-red-500/10 transition-colors shrink-0"
                  aria-label={`Delete diagram for ${item.topicName}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <DiagramCanvas diagram={item.diagram} compact />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
