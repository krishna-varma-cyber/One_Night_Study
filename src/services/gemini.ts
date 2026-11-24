import {
  BlueprintUnit,
  ExamKitData,
  PriorityLevel,
  RoadmapData,
  TopicItem,
  UploadedFileItem,
} from '../types';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

function buildFileParts(files: UploadedFileItem[]): GeminiPart[] {
  const parts: GeminiPart[] = [];
  for (const file of files) {
    if (file.textContent) {
      parts.push({
        text: `[Uploaded File: ${file.name}]\n${file.textContent.slice(0, 25000)}`,
      });
    } else if (file.base64Data) {
      parts.push({
        inlineData: {
          mimeType: file.mimeType || 'application/octet-stream',
          data: file.base64Data,
        },
      });
    }
  }
  return parts;
}

function extractJson<T>(raw: string): T {
  const trimmed = raw.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;
  return JSON.parse(candidate) as T;
}

async function callGemini<T>(
  apiKey: string,
  parts: GeminiPart[],
  responseSchema: Record<string, unknown>
): Promise<T> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('Please connect your Gemini API key first.');
  }

  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': cleanKey,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.4,
      },
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as GeminiResponse;

  if (!response.ok) {
    const apiMessage = payload.error?.message || `Request failed (${response.status})`;
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      throw new Error(`Invalid or unauthorized API key: ${apiMessage}`);
    }
    if (response.status === 429) {
      throw new Error('Rate limit reached on your Gemini API key. Wait a few seconds and retry.');
    }
    throw new Error(apiMessage);
  }

  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned an empty response. Please try again.');
  }

  try {
    return extractJson<T>(text);
  } catch {
    throw new Error('Could not parse structured study plan from Gemini. Please try again.');
  }
}

export interface GeneratedPlanResult {
  subjectName: string;
  topics: TopicItem[];
  roadmap: RoadmapData;
  blueprint: BlueprintUnit[];
  uploadedContextSummary: string;
}

interface RawPlanPayload {
  subjectName: string;
  uploadedContextSummary: string;
  topics: Array<{
    name: string;
    unit: string;
    priority: PriorityLevel;
    estimatedMinutes: number;
  }>;
  roadmap: {
    highPriority: string[];
    mediumPriority: string[];
    lowPriority: string[];
    timeline: Array<{
      window: string;
      focus: string;
      topics: string[];
      strategy: string;
    }>;
  };
  blueprint: Array<{
    unit: string;
    topics: string[];
    expectedMarks: number;
    questionTypes: string[];
  }>;
}

export async function generateSubjectPlan(params: {
  apiKey: string;
  userInput: string;
  files: UploadedFileItem[];
  theme: string;
}): Promise<GeneratedPlanResult> {
  const { apiKey, userInput, files, theme } = params;

  const themeInstruction = theme.trim()
    ? `Active User Theme / Style: "${theme.trim()}". Apply this tone and phrasing naturally in strategies and summaries.`
    : 'Tone: Practical, encouraging, senior BTech student explaining clearly for a 1-night exam sprint.';

  const promptText = `You are a sharp Indian BTech exam strategist helping a student who has 1 night left before tomorrow's exam.
${themeInstruction}

User Input:
"${userInput.trim()}"

Instructions:
1. Extract the exact Subject Name and ALL Topics mentioned in the user input and/or any attached syllabus/notes files.
   - Only use the topics provided or found in uploaded files. Do NOT invent unrelated topics if the user gave a clear list. If the user only gave a subject name + uploaded file, extract the key topics from the uploaded file.
2. Group topics logically into Units (e.g., Unit 1, Unit 2, etc.) and classify each topic's priority as "High", "Medium", or "Low" based on core exam importance.
3. Build a practical 8-Hour 1-Night Roadmap with EXACTLY these 4 timeline windows in order:
   - "Hour 0-2": High priority core topics
   - "Hour 2-5": Medium priority topics
   - "Hour 5-7": Revise 2-mark answers & key definitions/formulas
   - "Hour 7-8": Sleep + 5 AM quick revision
4. Build an Exam Blueprint table mapping Units -> Topics -> Expected Marks (total around 70 or 100 marks typical of BTech semester exams) -> Question Types (chosen from "2-mark", "5-mark", "10-mark").
5. Provide a brief 1-2 sentence uploadedContextSummary capturing any key points from attached files (or empty string if no files).`;

  const schema = {
    type: 'OBJECT',
    properties: {
      subjectName: { type: 'STRING' },
      uploadedContextSummary: { type: 'STRING' },
      topics: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            unit: { type: 'STRING' },
            priority: { type: 'STRING', enum: ['High', 'Medium', 'Low'] },
            estimatedMinutes: { type: 'INTEGER' },
          },
          required: ['name', 'unit', 'priority', 'estimatedMinutes'],
        },
      },
      roadmap: {
        type: 'OBJECT',
        properties: {
          highPriority: { type: 'ARRAY', items: { type: 'STRING' } },
          mediumPriority: { type: 'ARRAY', items: { type: 'STRING' } },
          lowPriority: { type: 'ARRAY', items: { type: 'STRING' } },
          timeline: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                window: { type: 'STRING' },
                focus: { type: 'STRING' },
                topics: { type: 'ARRAY', items: { type: 'STRING' } },
                strategy: { type: 'STRING' },
              },
              required: ['window', 'focus', 'topics', 'strategy'],
            },
          },
        },
        required: ['highPriority', 'mediumPriority', 'lowPriority', 'timeline'],
      },
      blueprint: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            unit: { type: 'STRING' },
            topics: { type: 'ARRAY', items: { type: 'STRING' } },
            expectedMarks: { type: 'INTEGER' },
            questionTypes: { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: ['unit', 'topics', 'expectedMarks', 'questionTypes'],
        },
      },
    },
    required: ['subjectName', 'uploadedContextSummary', 'topics', 'roadmap', 'blueprint'],
  };

  const parts: GeminiPart[] = [{ text: promptText }, ...buildFileParts(files)];
  const raw = await callGemini<RawPlanPayload>(apiKey, parts, schema);

  const topics: TopicItem[] = (raw.topics || []).map((t, index) => ({
    id: `topic_${Date.now()}_${index}`,
    name: t.name.trim(),
    unit: t.unit.trim() || `Unit ${index + 1}`,
    priority: t.priority || 'Medium',
    estimatedMinutes: t.estimatedMinutes || 35,
  }));

  return {
    subjectName: raw.subjectName?.trim() || 'Exam Subject',
    uploadedContextSummary: raw.uploadedContextSummary?.trim() || '',
    topics,
    roadmap: {
      totalTopics: topics.length,
      totalTime: '8 Hours',
      highPriority: raw.roadmap?.highPriority || [],
      mediumPriority: raw.roadmap?.mediumPriority || [],
      lowPriority: raw.roadmap?.lowPriority || [],
      timeline: raw.roadmap?.timeline || [],
      passLine: 'If you finish 5 topics, you can pass',
    },
    blueprint: raw.blueprint || [],
  };
}

interface RawExamKitPayload {
  understandIn5Mins: string;
  twoMarkAnswer: string[];
  fiveMarkAnswer: string[];
  tenMarkAnswer: {
    intro: string;
    steps: Array<{ heading: string; detail: string }>;
    conclusion: string;
  };
  realLifeExample: {
    contextTag: string;
    explanation: string;
  };
  diagram: {
    title: string;
    caption: string;
    layout: 'flow' | 'layered' | 'cycle' | 'hub';
    nodes: Array<{ id: string; label: string; sublabel?: string }>;
    edges: Array<{ from: string; to: string; label?: string }>;
  };
}

export async function generateTopicExamKit(params: {
  apiKey: string;
  subjectName: string;
  topic: TopicItem;
  uploadedContextSummary?: string;
  theme: string;
}): Promise<ExamKitData> {
  const { apiKey, subjectName, topic, uploadedContextSummary, theme } = params;

  const themeInstruction = theme.trim()
    ? `CRITICAL THEME INSTRUCTION: Follow this user theme for ALL explanations: "${theme.trim()}".`
    : 'Default style for "Understand in 5 mins": Simple English + Telugu mix (romanized Telugu like a friendly BTech senior explaining in a hostel room at midnight, e.g., "Bro simple ga cheppalante..."). Keep the 2-mark, 5-mark, and 10-mark answers clean, formal, exam-writable English so the student scores full marks on the paper.';

  const promptText = `You are helping an Indian BTech student prepare for tomorrow's "${subjectName}" exam on the topic "${topic.name}" (${topic.unit}).
${uploadedContextSummary ? `Context from uploaded syllabus/notes: ${uploadedContextSummary}` : ''}
${themeInstruction}

Generate a complete, accurate, high-scoring Exam Kit with these exact sections:
1. understandIn5Mins: Intuitive, crystal-clear explanation following the theme instruction above (around 120-160 words).
2. twoMarkAnswer: Array of EXACTLY 3 concise, crisp exam-writable lines/sentences.
3. fiveMarkAnswer: Array of 8 to 10 structured, exam-writable lines/points covering definition, core mechanism, and key advantage/application.
4. tenMarkAnswer: Structured long-answer ready to write on an answer sheet:
   - intro: Clear definition & significance (2-3 sentences).
   - steps: 4 to 6 detailed working steps / components / phases, each with a concise heading and 2-3 sentences of technical detail.
   - conclusion: Crisp wrap-up mentioning use-cases/trade-offs (2 sentences).
5. realLifeExample: One relatable Indian BTech everyday example (like WhatsApp, UPI, OTP, IRCTC, college Wi-Fi, ATM, etc. matching the topic) with:
   - contextTag: Short name like "WhatsApp" or "UPI" or "OTP"
   - explanation: 2-3 clear sentences connecting the real-life scenario to "${topic.name}".
6. diagram: A clean, neat diagram that a student can draw with pen on their exam paper!
   - title: Diagram title (e.g., "${topic.name} Architecture / Flow")
   - caption: 1-line pen-drawing tip for the exam sheet
   - layout: Choose the best fit from "flow" (step-by-step pipeline, 4-6 nodes), "layered" (top-to-bottom architecture stack, 3-5 nodes), "cycle" (feedback loop, 4 nodes), or "hub" (central controller + components, 4-5 nodes).
   - nodes: 4 to 6 concise nodes (id like "n1", "n2", short label <= 22 chars, optional short sublabel <= 26 chars).
   - edges: Directed connections between node ids with optional short verb/data label (<= 18 chars).`;

  const schema = {
    type: 'OBJECT',
    properties: {
      understandIn5Mins: { type: 'STRING' },
      twoMarkAnswer: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      fiveMarkAnswer: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      tenMarkAnswer: {
        type: 'OBJECT',
        properties: {
          intro: { type: 'STRING' },
          steps: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                heading: { type: 'STRING' },
                detail: { type: 'STRING' },
              },
              required: ['heading', 'detail'],
            },
          },
          conclusion: { type: 'STRING' },
        },
        required: ['intro', 'steps', 'conclusion'],
      },
      realLifeExample: {
        type: 'OBJECT',
        properties: {
          contextTag: { type: 'STRING' },
          explanation: { type: 'STRING' },
        },
        required: ['contextTag', 'explanation'],
      },
      diagram: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          caption: { type: 'STRING' },
          layout: { type: 'STRING', enum: ['flow', 'layered', 'cycle', 'hub'] },
          nodes: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                id: { type: 'STRING' },
                label: { type: 'STRING' },
                sublabel: { type: 'STRING' },
              },
              required: ['id', 'label'],
            },
          },
          edges: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                from: { type: 'STRING' },
                to: { type: 'STRING' },
                label: { type: 'STRING' },
              },
              required: ['from', 'to'],
            },
          },
        },
        required: ['title', 'caption', 'layout', 'nodes', 'edges'],
      },
    },
    required: [
      'understandIn5Mins',
      'twoMarkAnswer',
      'fiveMarkAnswer',
      'tenMarkAnswer',
      'realLifeExample',
      'diagram',
    ],
  };

  const raw = await callGemini<RawExamKitPayload>(apiKey, [{ text: promptText }], schema);

  return {
    topicId: topic.id,
    topicName: topic.name,
    understandIn5Mins: raw.understandIn5Mins,
    twoMarkAnswer: raw.twoMarkAnswer || [],
    fiveMarkAnswer: raw.fiveMarkAnswer || [],
    tenMarkAnswer: raw.tenMarkAnswer,
    realLifeExample: raw.realLifeExample,
    diagram: raw.diagram,
    generatedAt: Date.now(),
  };
}
