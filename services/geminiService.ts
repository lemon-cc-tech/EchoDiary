import { GoogleGenAI, Type } from "@google/genai";
import { DiaryLanguage, DiaryStyle, JournalEntry } from "../types";
import { AI_MODEL_NAME } from "../constants";

interface GenerateEntryParams {
  transcript: string;
  currentEntry: JournalEntry | null;
  preferences: {
    style: DiaryStyle;
    language: DiaryLanguage;
  };
}

export const generateJournalEntry = async (params: GenerateEntryParams): Promise<Partial<JournalEntry> | null> => {
  const { transcript, preferences } = params;

  if (!transcript.trim()) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemPrompt = `
      You are Echo, a serene and empathetic AI journaling assistant. 
      Your goal is to transform raw spoken thoughts into beautiful, structured journal entries.
      
      Configuration:
      - Style: ${preferences.style}
      - Output Language: ${preferences.language}
      
      Instructions:
      1. Analyze the provided transcript.
      2. Create a cohesive 'diaryNarrative' written in the first person, matching the requested style.
      3. Generate a very short 'daySummary' (1 sentence).
      4. Extract key insights as 'journalSummary' (bullet points).
      5. Determine the dominant 'emotion' and assign a pastel hex color that represents it.
      6. Identify 1-3 'categories' or themes (e.g., "Work", "Family", "Personal Growth"). Use consistent, Title Case tags.
      
      CRITICAL RULES FOR ACCURACY:
      - NO HALLUCINATIONS: Do NOT invent details, reasons, or outcomes that are not explicitly in the text.
      - SEPARATE EVENTS: If the user mentions two distinct events (e.g., "I played cricket" and later "I feel sad"), do NOT assume they are connected (e.g., do NOT say "I felt sad because I played badly") unless the user explicitly stated the cause.
      - RESPECT DISCONTINUITY: It is acceptable for the narrative to transition between topics without a forced segue if the original thoughts were unrelated. Prioritize factual accuracy over narrative flow when connecting disparate events.

      If the language is set to MATCH_INPUT, detect the dominant language of the transcript and write the response in that language.
    `;

    const response = await ai.models.generateContent({
      model: AI_MODEL_NAME,
      contents: `Transcript: "${transcript}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diaryNarrative: { type: Type.STRING, description: "The main journal entry text." },
            daySummary: { type: Type.STRING, description: "A one-sentence summary." },
            journalSummary: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "List of key bullet points." 
            },
            emotion: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "Name of the emotion (e.g., Peaceful)." },
                color: { type: Type.STRING, description: "Hex color code (pastel)." }
              },
              required: ["label", "color"]
            },
            categories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of category tags."
            }
          },
          required: ["diaryNarrative", "daySummary", "journalSummary", "emotion", "categories"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");

    return JSON.parse(resultText);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};