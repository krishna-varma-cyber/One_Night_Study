import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowUp,
  FileText,
  Loader2,
  Menu,
  Plus,
  X,
} from 'lucide-react';
import { ApiKeyModal } from './components/ApiKeyModal';
import { BlueprintCard } from './components/BlueprintCard';
import { ExamKitView } from './components/ExamKitView';
import { MediaGallery } from './components/MediaGallery';
import { RoadmapCard } from './components/RoadmapCard';
import { Sidebar } from './components/Sidebar';
import { ThemeModal } from './components/ThemeModal';
import { generateSubjectPlan, generateTopicExamKit } from './services/gemini';
import {
  MediaDiagramItem,
  SubjectSession,
  TopicItem,
  UploadedFileItem,
} from './types';

const STORAGE_KEYS = {
  API_KEY: 'nb_gemini_api_key',
  THEME: 'nb_theme',
  SESSION: 'nb_session',
  MEDIA: 'nb_media',
};

const THEME_PILLS = ['Discover', 'Ask anything', 'Take action', 'Create images'] as const;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read file'));
        return;
      }
      const commaIndex = result.indexOf(',');
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function App() {
  // Persisted API key in state only for API calls — never rendered in full in DOM
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
    } catch {
      return '';
    }
  });
  const [theme, setTheme] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || '';
    } catch {
      return '';
    }
  });
  const [session, setSession] = useState<SubjectSession | null>(() =>
    readStorage<SubjectSession | null>(STORAGE_KEYS.SESSION, null)
  );
  const [mediaItems, setMediaItems] = useState<MediaDiagramItem[]>(() =>
    readStorage<MediaDiagramItem[]>(STORAGE_KEYS.MEDIA, [])
  );

  // UI state
  const [activeView, setActiveView] = useState<'planner' | 'media'>('planner');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Center composer state
  const [promptInput, setPromptInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState('');

  // Exam kit loading / error state per topic
  const [loadingTopicId, setLoadingTopicId] = useState<string | null>(null);
  const [kitErrorByTopic, setKitErrorByTopic] = useState<Record<string, string>>({});

  // Modals & toast
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [apiModalNotice, setApiModalNotice] = useState('');
  const [justConnected, setJustConnected] = useState(false);
  const [showConnectedToast, setShowConnectedToast] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [selectedThemePill, setSelectedThemePill] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const connectTimerRef = useRef<number | null>(null);

  // Sync theme, session, media to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // ignore quota errors
    }
  }, [theme]);

  useEffect(() => {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    } catch {
      // ignore quota errors
    }
  }, [session]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(mediaItems));
    } catch {
      // ignore quota errors
    }
  }, [mediaItems]);

  useEffect(() => {
    return () => {
      if (connectTimerRef.current) {
        window.clearTimeout(connectTimerRef.current);
      }
    };
  }, []);

  const hasApiKey = apiKey.trim().length > 0;
  const maskedSuffix = hasApiKey ? apiKey.trim().slice(-4) : '';

  const triggerBrainConnectedFeedback = () => {
    if (connectTimerRef.current) {
      window.clearTimeout(connectTimerRef.current);
    }
    setJustConnected(true);
    setShowConnectedToast(true);
    connectTimerRef.current = window.setTimeout(() => {
      setJustConnected(false);
      setShowConnectedToast(false);
    }, 3000);
  };

  const handleSaveNewApiKey = (newKey: string) => {
    const trimmed = newKey.trim();
    if (!trimmed) return;
    try {
      localStorage.setItem(STORAGE_KEYS.API_KEY, trimmed);
    } catch {
      // ignore storage failure
    }
    setApiKey(trimmed);
    setApiModalNotice('');
    setApiModalOpen(false);
    triggerBrainConnectedFeedback();
  };

  const handleKeepExistingKey = () => {
    setApiModalNotice('');
    setApiModalOpen(false);
  };

  const handleRemoveApiKey = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
    } catch {
      // ignore
    }
    setApiKey('');
    setJustConnected(false);
    setShowConnectedToast(false);
    setApiModalNotice('');
    setApiModalOpen(false);
  };

  const handleNewChat = () => {
    setSession(null);
    setActiveTopicId(null);
    setActiveView('planner');
    setPromptInput('');
    setUploadedFiles([]);
    setPlanError('');
    setKitErrorByTopic({});
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const processed: UploadedFileItem[] = [];
    for (const file of files) {
      const id = `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const isText =
        file.type.startsWith('text/') ||
        /\.(txt|md|csv)$/i.test(file.name);

      if (isText) {
        const textContent = await file.text();
        processed.push({
          id,
          name: file.name,
          mimeType: file.type || 'text/plain',
          size: file.size,
          textContent,
        });
      } else {
        const base64Data = await fileToBase64(file);
        processed.push({
          id,
          name: file.name,
          mimeType: file.type || 'application/pdf',
          size: file.size,
          base64Data,
        });
      }
    }

    setUploadedFiles((prev) => [...prev, ...processed]);
    // Reset input so re-selecting same file works
    e.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSendPlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = promptInput.trim();

    if (!trimmed && uploadedFiles.length === 0) {
      setPlanError('Enter a subject and topics, or attach your syllabus/notes.');
      return;
    }

    if (!hasApiKey) {
      setApiModalNotice('Connect your Gemini API Key to generate your 1-night war plan.');
      setApiModalOpen(true);
      return;
    }

    setPlanError('');
    setIsGeneratingPlan(true);
    setActiveView('planner');
    setActiveTopicId(null);

    try {
      const effectivePrompt =
        trimmed ||
        `Extract the subject name and all topics from the attached syllabus/notes files (${uploadedFiles
          .map((f) => f.name)
          .join(', ')}).`;

      const result = await generateSubjectPlan({
        apiKey,
        userInput: effectivePrompt,
        files: uploadedFiles,
        theme,
      });

      const nextSession: SubjectSession = {
        subjectName: result.subjectName,
        rawInput: effectivePrompt,
        topics: result.topics,
        roadmap: result.roadmap,
        blueprint: result.blueprint,
        examKits: {},
        uploadedContextSummary: result.uploadedContextSummary,
        createdAt: Date.now(),
      };

      setSession(nextSession);
      setPromptInput('');
      setUploadedFiles([]);
    } catch (err) {
      setPlanError(
        err instanceof Error ? err.message : 'Something went wrong generating your study plan.'
      );
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const loadExamKitForTopic = async (topic: TopicItem, forceRegenerate = false) => {
    if (!session) return;
    setActiveView('planner');
    setActiveTopicId(topic.id);

    if (!forceRegenerate && session.examKits[topic.id]) {
      return;
    }

    if (!hasApiKey) {
      setApiModalNotice('Connect your Gemini API Key to generate this topic Exam Kit.');
      setApiModalOpen(true);
      return;
    }

    setLoadingTopicId(topic.id);
    setKitErrorByTopic((prev) => {
      const copy = { ...prev };
      delete copy[topic.id];
      return copy;
    });

    try {
      const kit = await generateTopicExamKit({
        apiKey,
        subjectName: session.subjectName,
        topic,
        uploadedContextSummary: session.uploadedContextSummary,
        theme,
      });

      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          examKits: {
            ...prev.examKits,
            [topic.id]: kit,
          },
        };
      });

      // Auto-save diagram to Media section
      setMediaItems((prev) => {
        const filtered = prev.filter(
          (item) =>
            !(
              item.subjectName.toLowerCase() === session.subjectName.toLowerCase() &&
              item.topicName.toLowerCase() === topic.name.toLowerCase()
            )
        );
        const newMedia: MediaDiagramItem = {
          id: `media_${Date.now()}_${topic.id}`,
          subjectName: session.subjectName,
          topicName: topic.name,
          diagram: kit.diagram,
          createdAt: Date.now(),
        };
        return [newMedia, ...filtered];
      });
    } catch (err) {
      setKitErrorByTopic((prev) => ({
        ...prev,
        [topic.id]: err instanceof Error ? err.message : 'Failed to generate Exam Kit.',
      }));
    } finally {
      setLoadingTopicId((current) => (current === topic.id ? null : current));
    }
  };

  const handleSelectTopic = (topicId: string) => {
    if (!session) return;
    const topic = session.topics.find((t) => t.id === topicId);
    if (!topic) return;
    void loadExamKitForTopic(topic, false);
  };

  const handleDeleteMedia = (id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  };

  const activeTopic =
    session && activeTopicId
      ? session.topics.find((t) => t.id === activeTopicId) || null
      : null;

  return (
    <div className="h-screen w-full bg-[#0B0B0D] text-[#F3F4F6] flex flex-col md:flex-row overflow-hidden">
      {/* Left Sidebar (280px, #121212) */}
      <Sidebar
        topics={session?.topics || []}
        activeTopicId={activeTopicId}
        activeView={activeView}
        hasApiKey={hasApiKey}
        justConnected={justConnected}
        mediaCount={mediaItems.length}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onNewChat={handleNewChat}
        onOpenMedia={() => setActiveView('media')}
        onSelectTopic={handleSelectTopic}
        onOpenApiModal={() => {
          setApiModalNotice('');
          setApiModalOpen(true);
        }}
      />

      {/* Right Main Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Compact Mobile Header (stays well below 15% mobile viewport cap) */}
        <header className="md:hidden h-14 px-4 border-b border-white/[0.08] bg-[#121212] flex items-center justify-between gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center rounded-xl text-zinc-300 hover:bg-white/[0.06] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-base font-semibold text-zinc-100 truncate">Night Before</span>
          <button
            type="button"
            onClick={() => {
              setApiModalNotice('');
              setApiModalOpen(true);
            }}
            className="min-h-[44px] px-3 rounded-xl text-xs font-medium text-zinc-200 bg-white/[0.05] border border-white/[0.08] flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <span>{justConnected ? 'Brain Connected' : 'Add API'}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                hasApiKey ? 'bg-green-500' : 'bg-zinc-500'
              }`}
            />
          </button>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10">
          <div
            className={`mx-auto w-full max-w-4xl ${
              !session && activeView === 'planner'
                ? 'min-h-full flex flex-col justify-center py-6'
                : 'space-y-8 pb-12'
            }`}
          >
            {activeView === 'media' ? (
              <MediaGallery
                items={mediaItems}
                onBackToPlanner={() => setActiveView('planner')}
                onDeleteItem={handleDeleteMedia}
              />
            ) : activeTopic ? (
              <ExamKitView
                topic={activeTopic}
                kit={session?.examKits[activeTopic.id]}
                isLoading={loadingTopicId === activeTopic.id}
                error={kitErrorByTopic[activeTopic.id]}
                onBackToOverview={() => setActiveTopicId(null)}
                onRegenerate={() => void loadExamKitForTopic(activeTopic, true)}
              />
            ) : (
              <>
                {/* Center Prompt & Composer Section */}
                <div className="space-y-6">
                  <div className="text-center space-y-2.5 max-w-2xl mx-auto">
                    <h1
                      className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-zinc-100"
                      style={{ textWrap: 'balance' }}
                    >
                      Welcome lets prepare for tomorrow&apos;s war
                    </h1>
                    <p className="text-sm sm:text-base text-zinc-400">
                      Enter subject and topics, get your 1-night plan
                    </p>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,image/*,.txt,.md,.csv"
                    onChange={handleFilesSelected}
                    className="hidden"
                    aria-label="Upload syllabus or notes"
                  />

                  {/* Meta AI style large rounded center input box */}
                  <form onSubmit={handleSendPlan} className="space-y-3">
                    <div className="rounded-3xl bg-[#16171B] border border-white/[0.11] focus-within:border-blue-500/70 transition-colors p-2.5 sm:p-3 flex items-end gap-2 sm:gap-3 shadow-lg shadow-black/30">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach Syllabus or Notes (PDF, Image, .txt)"
                        aria-label="Attach Syllabus or Notes"
                        className="min-h-[44px] min-w-[44px] rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 flex items-center justify-center transition-colors shrink-0"
                      >
                        <Plus className="w-5 h-5" />
                      </button>

                      <textarea
                        rows={1}
                        value={promptInput}
                        onChange={(e) => {
                          setPromptInput(e.target.value);
                          setPlanError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            void handleSendPlan();
                          }
                        }}
                        placeholder="Enter the subject name and topics"
                        className="flex-1 bg-transparent text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 resize-none py-2.5 px-1 focus:outline-none max-h-36 leading-relaxed"
                      />

                      <button
                        type="submit"
                        disabled={isGeneratingPlan}
                        aria-label="Generate 1-night plan"
                        className="min-h-[44px] min-w-[44px] rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white flex items-center justify-center transition-colors shrink-0"
                      >
                        {isGeneratingPlan ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <ArrowUp className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Uploaded File Chips under input */}
                    {uploadedFiles.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2 px-1">
                        {uploadedFiles.map((file) => (
                          <div
                            key={file.id}
                            className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/[0.1] pl-3 pr-1.5 py-1 text-xs text-zinc-200 max-w-full"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(file.id)}
                              className="w-6 h-6 rounded-full hover:bg-white/[0.12] flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors shrink-0"
                              aria-label={`Remove ${file.name}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* Theme Pill Row */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      {THEME_PILLS.map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            setSelectedThemePill(label);
                            setThemeModalOpen(true);
                          }}
                          className="min-h-[40px] px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs sm:text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0"
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {theme ? (
                      <p className="text-center text-xs text-zinc-400">
                        Active theme: <span className="text-zinc-200">{theme}</span>
                      </p>
                    ) : null}
                  </form>

                  {/* Error or Loading State */}
                  {planError ? (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 flex items-center gap-2.5 text-sm text-red-200">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{planError}</span>
                    </div>
                  ) : null}

                  {isGeneratingPlan ? (
                    <div className="rounded-2xl bg-[#16171B] border border-white/[0.08] p-6 space-y-3">
                      <div className="flex items-center gap-3 text-sm text-blue-300">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Parsing topics and building your 1-Night Roadmap &amp; Exam Blueprint...</span>
                      </div>
                      <div className="space-y-2.5 animate-pulse pt-2">
                        <div className="h-4 bg-white/[0.07] rounded w-2/3" />
                        <div className="h-4 bg-white/[0.05] rounded w-full" />
                        <div className="h-24 bg-white/[0.04] rounded-xl w-full" />
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* AFTER SUBJECT ENTERED - MAIN CONTENT IN ORDER: 1. ROADMAP CARD, 2. BLUEPRINT CARD */}
                {session && !isGeneratingPlan ? (
                  <div className="space-y-6">
                    <RoadmapCard
                      subjectName={session.subjectName}
                      roadmap={session.roadmap}
                      topics={session.topics}
                      onSelectTopic={handleSelectTopic}
                    />
                    <BlueprintCard blueprint={session.blueprint} />
                  </div>
                ) : null}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Brain Connected Toast (exact 3 seconds) */}
      {showConnectedToast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 rounded-xl bg-[#16171B] border border-green-500/35 px-4 py-3 shadow-xl flex items-center gap-2.5"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
          <span className="text-sm font-medium text-zinc-100">Brain Connected</span>
        </div>
      ) : null}

      {/* API Key Popup */}
      <ApiKeyModal
        isOpen={apiModalOpen}
        hasSavedKey={hasApiKey}
        maskedSuffix={maskedSuffix}
        notice={apiModalNotice}
        onClose={() => {
          setApiModalNotice('');
          setApiModalOpen(false);
        }}
        onSaveNewKey={handleSaveNewApiKey}
        onKeepExistingKey={handleKeepExistingKey}
        onRemoveKey={handleRemoveApiKey}
      />

      {/* Theme Popup */}
      <ThemeModal
        isOpen={themeModalOpen}
        currentTheme={theme}
        selectedModeLabel={selectedThemePill}
        onClose={() => setThemeModalOpen(false)}
        onSaveTheme={(nextTheme) => setTheme(nextTheme)}
      />
    </div>
  );
}
