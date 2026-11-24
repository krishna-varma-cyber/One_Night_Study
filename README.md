# Night Before

A mobile-first, dark-theme exam preparation web app built for BTech students who need a structured 1-night study plan from a subject name, topic list, or uploaded syllabus/notes.

## Features

- **1-Night Roadmap (`Hour 0-8`)**: Organizes your topics into High, Medium, and Low priority groups across a structured 8-hour timeline (`Hour 0-2`, `Hour 2-5`, `Hour 5-7`, `Hour 7-8`) with a clear pass target.
- **Exam Blueprint**: Maps units, topics, expected marks, and question types (`2-mark`, `5-mark`, `10-mark`) with visual marks distribution bars.
- **Topic Exam Kits**: Click any topic in the sidebar or roadmap to generate:
  - **Understand in 5 mins** (clear conceptual breakdown)
  - **2-Mark Answer** (3 concise exam-ready lines)
  - **5-Mark Answer** (structured 8–10 line answer)
  - **10-Mark Answer** (Introduction, Working/Steps, Conclusion)
  - **One Diagram to Draw + One Real Life Example**
- **Media Gallery**: Automatically saves generated topic diagrams and flowcharts for quick revision.
- **Syllabus & Notes Upload**: Attach multiple PDF, image, or text files (`.pdf`, images, `.txt`, `.md`, `.csv`) directly from the `+` button inside the prompt box.
- **Custom Theme Mode**: Set a one-line explanation style (for example, hostel senior explanation style) that applies across roadmaps, blueprints, and exam kits.
- **Browser-Only Storage & BYO Gemini Key**: Topics, themes, saved diagrams, and your Gemini API key stay in your browser's `localStorage`. Existing API keys are masked (`••••••••...XXXX`) and never displayed in full after saving.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **AI**: Google Gemini API (`gemini-2.5-flash` via `generativelanguage.googleapis.com`)

## Getting Started

### Prerequisites

- Node.js 18+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

### Build & Type-Check

```bash
npm run lint
npm run build
```

## Usage

1. Click **Add API** at the bottom of the left sidebar and paste your Gemini API key in the **Connect Your Brain** modal.
2. Enter your subject and topics in the center input box (or attach your syllabus/notes using `+`) and press **Send**.
3. Review **Your 1-Night Roadmap** and **Exam Blueprint**.
4. Click any topic under **Topics in this subject** in the sidebar to generate its **Exam Kit** and auto-save its diagram to **Media**.
