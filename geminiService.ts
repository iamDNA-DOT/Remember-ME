
import { GoogleGenAI, Type } from "@google/genai";
import { Memory, MemoryCategory } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are LIFE OS — a private cognitive operating system.
Your mission is to capture, structure, and retrieve user life data.

- If the input is a memory (default), analyze and categorize it. Return it in the specified JSON format.
- If the input is a retrieval request (e.g. "remember when", "what did I say about"), answer based on provided context.
- Keep responses concise, objective, and dense with insight.
`;

export async function processInput(
  input: string, 
  history: Memory[]
): Promise<{ type: 'storage' | 'retrieval' | 'insight'; data: any }> {
  // Logic to determine if it's retrieval or storage
  const retrievalKeywords = [
    'remember when', 'what did i say', 'find my thoughts', 
    'show patterns', 'summarize my life', 'what have i been consistent about',
    'what am i becoming', 'search'
  ];
  
  const isRetrieval = retrievalKeywords.some(kw => input.toLowerCase().includes(kw));

  if (isRetrieval) {
    const context = history.slice(-50).map(m => `[${m.timestamp}] (${m.category}): ${m.content}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Context: \n${context}\n\nUser Request: ${input}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\nRespond only as a retrieval engine. Surface original phrasing, context, and evolution of thought.",
        temperature: 0.2
      }
    });
    return { type: 'retrieval', data: response.text };
  } else {
    // Process as memory capture
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: input,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\nExtract the intent and facts. Categorize the input.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { 
              type: Type.STRING, 
              enum: ['Thought', 'Decision', 'Idea', 'Goal', 'Learning', 'Event', 'Relationship', 'Problem', 'Experiment', 'Identity']
            },
            intent: { type: Type.STRING },
            facts: { type: Type.ARRAY, items: { type: Type.STRING } },
            emotions: { type: Type.ARRAY, items: { type: Type.STRING } },
            importance: { type: Type.NUMBER },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            lifePhase: { type: Type.STRING }
          },
          required: ['category', 'intent']
        }
      }
    });

    try {
      const parsed = JSON.parse(response.text || '{}');
      return { type: 'storage', data: parsed };
    } catch (e) {
      return { 
        type: 'storage', 
        data: { category: 'Thought', intent: 'General reflection', facts: [], emotions: [], importance: 1, tags: [] }
      };
    }
  }
}
