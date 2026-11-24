import React from 'react';
import { Image as ImageIcon, MessageSquarePlus, X } from 'lucide-react';
import { TopicItem } from '../types';

interface SidebarProps {
  topics: TopicItem[];
  activeTopicId: string | null;
  activeView: 'planner' | 'media';
  hasApiKey: boolean;
  justConnected: boolean;
  mediaCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onNewChat: () => void;
  onOpenMedia: () => void;
  onSelectTopic: (topicId: string) => void;
  onOpenApiModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  topics,
  activeTopicId,
  activeView,
  hasApiKey,
  justConnected,
  mediaCount,
  mobileOpen,
  onCloseMobile,
  onNewChat,
  onOpenMedia,
  onSelectTopic,
  onOpenApiModal,
}) => {
  const sidebarBody = (
    <aside
      className="w-[280px] h-full bg-[#121212] border-r border-white/[0.08] flex flex-col justify-between shrink-0"
      aria-label="Sidebar navigation"
    >
      {/* 1. TOP */}
      <div className="p-4 space-y-2 border-b border-white/[0.06]">
        <div className="flex items-center justify-between md:hidden pb-2">
          <span className="text-sm font-semibold text-zinc-100 tracking-tight">Night Before</span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-sm font-medium text-zinc-100 flex items-center gap-2.5 transition-colors whitespace-nowrap"
        >
          <MessageSquarePlus className="w-4 h-4 text-zinc-300 shrink-0" />
          <span>New chat</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenMedia();
            onCloseMobile();
          }}
          className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors whitespace-nowrap ${
            activeView === 'media'
              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
              : 'text-zinc-300 hover:bg-white/[0.06] border border-transparent'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span>Media</span>
          </span>
          {mediaCount > 0 ? (
            <span className="text-xs text-zinc-400 tabular-nums">{mediaCount}</span>
          ) : null}
        </button>
      </div>

      {/* 2. MIDDLE - TOPIC LIST (READ ONLY) */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="px-2 pb-2.5">
          <h2 className="text-xs font-medium text-zinc-400 tracking-wide">
            Topics in this subject
          </h2>
        </div>

        {topics.length === 0 ? (
          <p className="px-2 py-3 text-xs leading-relaxed text-zinc-500">
            No topics yet - Enter subject and topics in center box
          </p>
        ) : (
          <ul className="space-y-1">
            {topics.map((topic, index) => {
              const isSelected = activeView === 'planner' && activeTopicId === topic.id;
              return (
                <li key={topic.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTopic(topic.id);
                      onCloseMobile();
                    }}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-left transition-colors flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-500/15 text-blue-200 border border-blue-500/30'
                        : 'text-zinc-300 hover:bg-white/[0.06] border border-transparent'
                    }`}
                  >
                    <span className="text-sm font-medium truncate">
                      <span className="text-zinc-500 mr-1.5 tabular-nums">{index + 1}.</span>
                      {topic.name}
                    </span>
                    <span className="text-[11px] text-zinc-400 shrink-0">{topic.priority}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 3. BOTTOM - API BUTTON ONLY */}
      <div className="p-4 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={() => {
            onOpenApiModal();
            onCloseMobile();
          }}
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-sm font-medium text-zinc-100 flex items-center justify-between transition-colors whitespace-nowrap"
        >
          <span>{justConnected ? 'Brain Connected' : 'Add API'}</span>
          <span
            className={`inline-block rounded-full shrink-0 transition-all duration-200 ${
              justConnected
                ? 'w-2.5 h-2.5 bg-green-500'
                : hasApiKey
                  ? 'w-2 h-2 bg-green-500'
                  : 'w-2.5 h-2.5 bg-zinc-500'
            }`}
            aria-label={hasApiKey ? 'Connected' : 'Not connected'}
          />
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <div className="hidden md:block h-full">{sidebarBody}</div>

      {/* Mobile slide-over drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarBody}</div>
        </div>
      ) : null}
    </>
  );
};
