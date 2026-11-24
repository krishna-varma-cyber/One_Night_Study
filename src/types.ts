export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface UploadedFileItem {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  base64Data?: string; // for images / pdfs
  textContent?: string; // for plain text / markdown / csv
}

export interface TopicItem {
  id: string;
  name: string;
  unit: string;
  priority: PriorityLevel;
  estimatedMinutes: number;
}

export interface TimelineBlock {
  window: string;
  focus: string;
  topics: string[];
  strategy: string;
}

export interface RoadmapData {
  totalTopics: number;
  totalTime: string;
  highPriority: string[];
  mediumPriority: string[];
  lowPriority: string[];
  timeline: TimelineBlock[];
  passLine: string;
}

export interface BlueprintUnit {
  unit: string;
  topics: string[];
  expectedMarks: number;
  questionTypes: string[];
}

export interface DiagramNode {
  id: string;
  label: string;
  sublabel?: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
}

export interface DiagramSpec {
  title: string;
  caption: string;
  layout: 'flow' | 'layered' | 'cycle' | 'hub';
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface ExamKitData {
  topicId: string;
  topicName: string;
  understandIn5Mins: string;
  twoMarkAnswer: string[];
  fiveMarkAnswer: string[];
  tenMarkAnswer: {
    intro: string;
    steps: { heading: string; detail: string }[];
    conclusion: string;
  };
  realLifeExample: {
    contextTag: string;
    explanation: string;
  };
  diagram: DiagramSpec;
  generatedAt: number;
}

export interface MediaDiagramItem {
  id: string;
  subjectName: string;
  topicName: string;
  diagram: DiagramSpec;
  createdAt: number;
}

export interface SubjectSession {
  subjectName: string;
  rawInput: string;
  topics: TopicItem[];
  roadmap: RoadmapData;
  blueprint: BlueprintUnit[];
  examKits: Record<string, ExamKitData>;
  uploadedContextSummary?: string;
  createdAt: number;
}
