import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Generates a random Notion Faces-style avatar.
 */
// Keep track of the last successful key index across calls
let currentKeyIndex = 0;

export const generateRandomNotionFace = async (modelName: string): Promise<string | null> => {
  // Collect all possible keys from environment variables
  const apiKeys: string[] = [];
  
  // Try to get keys from process.env (defined in vite.config.ts) or import.meta.env
  const k1 = (process.env as any).VITE_API_KEY_1 || (import.meta as any).env.VITE_API_KEY_1;
  const k2 = (process.env as any).VITE_API_KEY_2 || (import.meta as any).env.VITE_API_KEY_2;
  const k3 = (process.env as any).VITE_API_KEY_3 || (import.meta as any).env.VITE_API_KEY_3;
  
  const numberedKeys = [k1, k2, k3].filter(k => k && typeof k === 'string' && k.length > 5);
  apiKeys.push(...numberedKeys);

  if (apiKeys.length === 0) {
    const viteKey = (process.env as any).VITE_API_KEY || (import.meta as any).env.VITE_API_KEY;
    if (viteKey && typeof viteKey === 'string') {
      apiKeys.push(...viteKey.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 5));
    }
  }

  if (apiKeys.length === 0) {
    const fallbackKey = (process.env as any).API_KEY || (process.env as any).GEMINI_API_KEY;
    if (fallbackKey && typeof fallbackKey === 'string' && fallbackKey.length > 5) {
      apiKeys.push(fallbackKey);
    }
  }

  if (apiKeys.length === 0) {
    throw new Error("No valid API keys found. Please check your Vercel Environment Variables (VITE_API_KEY_1, etc.).");
  }

  let lastError: any = null;

  // Try each key starting from the last successful one
  for (let i = 0; i < apiKeys.length; i++) {
    // This formula handles the "looping" back to Key 1
    const index = (currentKeyIndex + i) % apiKeys.length;
    const apiKey = apiKeys[index];

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const headShapes = ["a rounded square head", "an irregular blob-like head", "a slightly squarish head with soft corners"];
      const eyeStyles = ["two simple dot eyes", "two small circular eyes", "two short horizontal line eyes", "two small oval eyes", "two half-moon upward-curved eyes"];
      const mouthStyles = ["a gently smiling curve mouth", "a straight line mouth", "a slightly wavy line mouth", "a small U-shaped mouth", "a short dash mouth"];
      
      const randomHeadShape = headShapes[Math.floor(Math.random() * headShapes.length)];
      const randomEyeStyle = eyeStyles[Math.floor(Math.random() * eyeStyles.length)];
      const randomMouthStyle = mouthStyles[Math.floor(Math.random() * mouthStyles.length)];

      const prompt = `A unique, random Notion Faces style avatar, featuring ${randomHeadShape}, ${randomEyeStyle}, and ${randomMouthStyle}. The style is minimalist, abstract, with bold, clean black outlines. Shading achieved solely through stippling. Strictly pure black and pure white. NO colors. NO background circle, NO circular frame, NO border around the face. Just the face itself on a plain white background.`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          // SUCCESS! Remember this index for the next call
          currentKeyIndex = index;
          return part.inlineData.data;
        }
      }
      return null;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || String(error);
      const isRateLimit = errorMessage.includes('429') || error?.status === 429 || errorMessage.toLowerCase().includes('rate limit');
      
      if (isRateLimit) {
        console.warn(`Key ${index + 1} is rate limited. Google says: "${errorMessage}". Trying next...`);
        continue;
      }
      
      console.error(`Key ${index + 1} failed with a non-rate-limit error:`, error);
      throw error;
    }
  }

  throw new Error(`All ${apiKeys.length} keys are currently exhausted. Please try again in a few minutes.`);
};
