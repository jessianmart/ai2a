import { GoogleGenAI, ChatSession, GenerateContentResponse } from "@google/genai";
import { Mode } from '../types';
import { SYSTEM_PROMPT_AGENT, SYSTEM_PROMPT_SKILL } from '../constants';

// We manage the chat instance here to keep context
let chatInstance: ChatSession | null = null;
let currentMode: Mode | null = null;

// Helper to get fresh instance
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
  
  // Initialize or Reset chat if mode changed
  if (!chatInstance || currentMode !== mode) {
    const systemInstruction = mode === Mode.AGENT_ARCHITECT ? SYSTEM_PROMPT_AGENT : SYSTEM_PROMPT_SKILL;
    
    chatInstance = ai.chats.create({
      model: 'gemini-3-flash-preview', // High speed, good reasoning
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // Creativity balance
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
