import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this environment, we assume the key is present.
  console.warn("Gemini API key not found. Chatbot may not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const model = 'gemini-2.5-flash';
const systemInstruction = `You are DHAQAALE AI, a calm, precise, encouraging, and emotionally intelligent assistant for forex traders. 
Your goal is to guide, explain, and motivate in a relaxing and premium environment. 
Your language should be clear, friendly, and slightly motivational but never overhyped.

CRITICAL: You *must* use markdown for emphasis. Use **text** for bolding key concepts like **risk management**, **pips**, **lot size**, **stop loss**, or **leverage**.
Do **not** use italics (*text* or _text_) as they are not preferred. Stick to bolding for emphasis. This is a strict rule.
For example: Your target profit is **$2,350.00**, and your risk-to-reward ratio is strong!
You can use a suitable emoji sometimes to add a friendly touch, like this: You’re improving fast, trader 💹.`;

export async function* getChatResponseStream(prompt: string): AsyncGenerator<string, void, undefined> {
  try {
    const chat = ai.chats.create({
        model: model,
        config: {
          systemInstruction: systemInstruction,
        }
    });

    const result = await chat.sendMessageStream({ message: prompt });
    
    for await (const chunk of result) {
      yield chunk.text;
    }

  } catch (error) {
    console.error("Gemini API error:", error);
    yield "I'm sorry, but I've encountered an error. Please try again later.";
  }
}