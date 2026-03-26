import { GoogleGenAI, ChatSession, GenerateContentResponse } from "@google/genai";
import { Mode } from '../types';
import { MODE_CONFIG } from '../constants';

let chatInstance: ChatSession | null = null;
let currentMode: Mode | null = null;

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const resetChat = () => {
  chatInstance = null;
  currentMode = null;
};

export const sendMessageStream = async (
  message: string,
  mode: Mode,
  onChunk: (text: string) => void
): Promise<string> => {
  const ai = getAI();

  if (!chatInstance || currentMode !== mode) {
    const config = MODE_CONFIG[mode];

    chatInstance = ai.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: config.prompt,
        temperature: 0.75,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });
    currentMode = mode;
  }

  try {
    const resultStream = await chatInstance.sendMessageStream({ message });
    let fullText = "";

    for await (const chunk of resultStream) {
       const c = chunk as GenerateContentResponse;
       const text = c.text;
       if (text) {
         fullText += text;
         onChunk(text);
       }
    }
    return fullText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Extract JSON config from a model response.
 * Looks for the first ```json ... ``` block and parses it.
 */
export const extractJsonFromResponse = (text: string): Record<string, unknown> | null => {
  const match = text.match(/```json\s*\n([\s\S]*?)```/);
  if (!match?.[1]) return null;
  try {
    return JSON.parse(match[1].trim());
  } catch {
    return null;
  }
};
