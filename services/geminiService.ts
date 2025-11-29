import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GradingReport, PersonaType, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const REPORT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.INTEGER, description: "Score out of 150" },
    summary: { type: Type.STRING, description: "Overall commentary based on selected persona tone" },
    knowledgePoints: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          point: { type: Type.STRING },
          covered: { type: Type.BOOLEAN },
          missingDetail: { type: Type.STRING }
        }
      }
    },
    logicStructure: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          section: { type: Type.STRING, description: "e.g., Introduction, Body Paragraph 1" },
          evaluation: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["good", "average", "poor"] }
        }
      }
    },
    keywordsDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
    errors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["fact", "date", "style", "grammar"] },
          original: { type: Type.STRING },
          correction: { type: Type.STRING },
          explanation: { type: Type.STRING }
        }
      }
    },
    radarData: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING, description: "Dimensions: Knowledge, Logic, Language, Innovation, Depth" },
          A: { type: Type.INTEGER, description: "User score 0-100" },
          B: { type: Type.INTEGER, description: "Standard/Passing score 0-100" },
          fullMark: { type: Type.INTEGER, description: "Always 100" }
        }
      }
    },
    optimization: {
      type: Type.OBJECT,
      properties: {
        originalSegment: { type: Type.STRING, description: "A weak paragraph from the user input" },
        improvedSegment: { type: Type.STRING, description: "Rewritten version in academic style" },
        reason: { type: Type.STRING }
      }
    },
    writingTemplates: {
      type: Type.OBJECT,
      properties: {
        brainstorming: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              technique: { type: Type.STRING, description: "Name of the thinking model, e.g., 'Internal vs External Analysis'" },
              template: { type: Type.STRING, description: "A step-by-step guide on HOW to think (e.g., 'Step 1: ..., Step 2: ...')" },
              example: { type: Type.STRING, description: "3 concrete arguments for THIS topic derived using this method" }
            }
          }
        },
        intro: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              technique: { type: Type.STRING, description: "Name of the technique, e.g., 'Historical Context Entry'" },
              template: { type: Type.STRING, description: "The abstract template pattern" },
              example: { type: Type.STRING, description: "The template applied to the specific topic" }
            }
          }
        },
        conclusion: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              technique: { type: Type.STRING, description: "Name of the technique, e.g., 'Cultural Value Elevation'" },
              template: { type: Type.STRING },
              example: { type: Type.STRING }
            }
          }
        }
      }
    },
    academicLanguageScore: { type: Type.INTEGER },
    handwritingEvaluation: {
      type: Type.OBJECT,
      properties: {
        legibility: { type: Type.STRING },
        estimatedWordCount: { type: Type.INTEGER },
        timeManagementAdvice: { type: Type.STRING }
      },
      nullable: true
    },
    comparativeLevel: { type: Type.STRING, enum: ["Excellent", "Good", "Pass", "Fail"] },
    comparativeComment: { type: Type.STRING },
    modelEssay: { type: Type.STRING, description: "A complete, high-quality model essay. Must include subheadings. Length must adapt: Noun Exp (~200 words), Short Answer (~400 words), Essay (~800+ words). Use academic terminology." }
  }
};

const MINDMAP_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    root: {
      type: Type.OBJECT,
      properties: {
        label: { type: Type.STRING },
        children: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              children: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { label: { type: Type.STRING } }
                }
              }
            }
          }
        }
      }
    }
  }
};

export const gradeSubmission = async (
  text: string,
  imageBase64: string | null,
  persona: PersonaType,
  topic: string
): Promise<GradingReport> => {
  const modelId = "gemini-2.5-flash"; // Excellent for text + vision analysis

  const personaInstruction = {
    professor: "You are a strict, authoritative professor at Tsinghua Academy of Arts & Design. Focus on academic rigor, historical accuracy, and depth. Critique harshly but constructively.",
    senior: "You are an encouraging, successful PhD student (Senior) from Tsinghua. Be supportive, use approachable language, but point out critical mistakes that could cost marks.",
    analyst: "You are an objective data analyst. Focus purely on structure, coverage percentages, and logic flow without emotional coloring."
  };

  const systemInstruction = `
    You are an expert grader for the Tsinghua University Academy of Arts & Design Master's Entrance Exam, Subject 621 (Art History & Theory).
    Reference Texts: 《中国美术史》, 《外国美术史》, 《世界现代设计史》.
    
    Your Task:
    1. Analyze the user's answer (text or handwriting image) for the topic: "${topic}".
    2. Check for factual errors (dates, artists, dynasties, styles).
    3. Evaluate against the standard "Total-Split-Total" (总-分-总) logical structure.
    4. Assess academic language usage.
    5. Compare with a hypothetical "Excellent Model Answer" standards.
    6. Provide a "One-click Optimization" rewrite for the weakest section.
    
    7. GENERATE WRITING TEMPLATES specifically for this topic:
       - **Brainstorming Templates** (Idea Generation): 2 distinct thinking frameworks for when students are stuck.
         - technique: A clear name for the mental model (e.g., "Internal vs External Factors", "Inheritance & Innovation Lens").
         - template: A step-by-step guide on HOW to think (e.g., "Step 1: Analyze the social environment... Step 2: Connect to the artist's personal style..."). DO NOT just give a fill-in-the-blank sentence. Give a process.
         - example: 3 concrete arguments for THIS topic derived using this method.
       - **Introduction Templates**: 2 Opening Strategies. How to combine historical context with the definition.
       - **Conclusion Templates**: 2 Elevation Strategies. How to summarize and elevate to cultural spirit or modern value.
       - For Intro/Conclusion, provide a "Template" pattern and a specific "Example" applied to this topic.

    8. GENERATE A FULL MODEL ESSAY (范文) for this topic.
       - CRITICAL: Determine the question type based on the topic complexity.
       - Type 1: "Noun Explanation" (名词解释). Target ~150-250 words. Structure: Definition -> Historical Context -> Artistic Characteristics -> Impact/Status.
       - Type 2: "Short Answer" (简答题). Target ~400-600 words. REQUIREMENT: Use numbered subheadings (e.g., "1. Point One", "2. Point Two") to clearly organize arguments.
       - Type 3: "Essay Question" (论述题). Target ~800-1200 words. REQUIREMENT: Use clear section titles (e.g., "一、Introduction", "二、Argument 1", "三、Argument 2", "四、Conclusion").
       - STYLE: Academic, rigorous, using specific terms from Tsinghua 621 reference books (e.g., "Spirit Resonance", "Form follows function").
       - FORMATTING: Use plain text with clear indentation/spacing. Do not use Markdown bold/italic symbols if they affect readability, just use clean structure.
       - PURPOSE: Provide a perfect example of a high-scoring answer.
    
    If an image is provided, perform OCR and also evaluate handwriting legibility and estimate word count.
    
    Output strictly in JSON format matching the schema.
    Tone: ${personaInstruction[persona]}
  `;

  const parts: any[] = [];
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64
      }
    });
    parts.push({ text: `Analyze this handwritten answer for the topic: ${topic}.` });
  } else {
    parts.push({ text: `Topic: ${topic}\n\nStudent Answer:\n${text}` });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: REPORT_SCHEMA,
        temperature: 0.3, // Low temperature for factual accuracy
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as GradingReport;
  } catch (error) {
    console.error("Grading failed:", error);
    throw new Error("Failed to generate grading report. Please try again.");
  }
};


export const generateMindMap = async (topic: string) => {
   const systemInstruction = `
    Generate a hierarchical mind map structure for a Tsinghua 621 Art History essay on the topic: "${topic}".
    The structure should cover: Definition, Background, Characteristics/Style, Key Artists/Works, Impact/Influence, and Conclusion.
   `;

   try {
     const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: { parts: [{ text: `Generate mind map for: ${topic}` }] },
       config: {
         systemInstruction,
         responseMimeType: "application/json",
         responseSchema: MINDMAP_SCHEMA
       }
     });
     return JSON.parse(response.text || "{}");
   } catch (e) {
     console.error(e);
     return null;
   }
}

export const getSuggestedQuestions = async (weakPoints: string[]) => {
    // Mock implementation for simplicity, in real app this would call API based on weakPoints
    return [
        { id: '1', type: 'noun_explanation', content: '解释“气韵生动”及其在六法论中的地位', topic: '中国画论' },
        { id: '2', type: 'short_answer', content: '简述包豪斯的设计教育体系及其影响', topic: '现代设计史' },
        { id: '3', type: 'essay', content: '论述现实主义美术在19世纪法国的发展', topic: '外国美术史' }
    ] as Question[];
}