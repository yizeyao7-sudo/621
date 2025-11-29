export interface KnowledgePoint {
  point: string;
  covered: boolean;
  missingDetail?: string;
}

export interface LogicNode {
  section: string;
  evaluation: string;
  status: 'good' | 'average' | 'poor';
}

export interface ErrorItem {
  type: 'fact' | 'date' | 'style' | 'grammar';
  original: string;
  correction: string;
  explanation: string;
}

export interface RadarMetric {
  subject: string;
  A: number; // User Score
  B: number; // Class Average/Standard
  fullMark: number;
}

export interface Optimization {
  originalSegment: string;
  improvedSegment: string;
  reason: string;
}

export interface WritingTemplateItem {
  technique: string;
  template: string; // The fill-in-the-blank structure
  example: string;  // Applied to the current topic
}

export interface WritingTemplates {
  brainstorming: WritingTemplateItem[]; // New field for argument generation ideas
  intro: WritingTemplateItem[];
  conclusion: WritingTemplateItem[];
}

export interface GradingReport {
  overallScore: number;
  summary: string; // Personalized feedback based on persona
  knowledgePoints: KnowledgePoint[];
  logicStructure: LogicNode[];
  keywordsDetected: string[];
  errors: ErrorItem[];
  radarData: RadarMetric[];
  optimization: Optimization;
  writingTemplates: WritingTemplates; // New field for templates
  academicLanguageScore: number; // 0-100
  handwritingEvaluation?: {
    legibility: string;
    estimatedWordCount: number;
    timeManagementAdvice: string;
  };
  comparativeLevel: 'Excellent' | 'Good' | 'Pass' | 'Fail'; // Compared to database
  comparativeComment: string;
  modelEssay: string; // A complete, high-quality model essay with subheadings, adapted to question type
}

export type PersonaType = 'professor' | 'senior' | 'analyst';

export interface Question {
  id: string;
  type: 'noun_explanation' | 'short_answer' | 'essay';
  content: string;
  year?: string;
  topic: string; // e.g., "Song Dynasty Landscape"
}