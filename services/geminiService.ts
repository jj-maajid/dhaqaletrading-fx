
import { GoogleGenAI } from "@google/genai";

// API_KEY is automatically injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

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
