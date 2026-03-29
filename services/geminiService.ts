import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Generates a random Notion Faces-style avatar.
 */
// Keep track of the last successful key index across calls
let currentKeyIndex = 0;

export const generateRandomNotionFace = async (modelName: string): Promise<string | null> => {
  // Collect all possible keys from environment variables
  const apiKeys: string[] = [];
  
  const numberedKeys = [
    (import.meta as any).env.VITE_API_KEY_1,
    (import.meta as any).env.VITE_API_KEY_2,
    (import.meta as any).env.VITE_API_KEY_3
  ].filter(k => k && k.length > 0);
  apiKeys.push(...numberedKeys);

  if (apiKeys.length === 0) {
    const viteKey = (import.meta as any).env.VITE_API_KEY;
    if (viteKey) {
      apiKeys.push(...viteKey.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0));
    }
  }

  if (apiKeys.length === 0 && process.env.API_KEY) {
    apiKeys.push(process.env.API_KEY);
  }

  if (apiKeys.length === 0) {
    throw new Error("No API keys found. Please set VITE_API_KEY_1, VITE_API_KEY_2, or VITE_API_KEY_3.");
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
      if (error?.message?.includes('429') || error?.status === 429) {
        console.warn(`Key ${index + 1} is rate limited. Trying next...`);
        continue;
      }
      throw error;
    }
  }

  throw new Error(`All ${apiKeys.length} keys are currently exhausted. Please try again in a few minutes.`);
};
