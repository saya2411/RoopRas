import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Generates a random Notion Faces-style avatar.
 */
// Keep track of the last successful key index across calls
let currentKeyIndex = 0;

import { GoogleGenAI } from "@google/genai";

/**
 * Generates a random Notion Faces-style avatar.
 */
export const generateRandomNotionFace = async (): Promise<any> => {
  // Try to get the API key from various possible environment variables
  // In Vite, client-side variables must be prefixed with VITE_
  const apiKey = (import.meta as any).env.VITE_API_KEY_1 || 
                 (import.meta as any).env.VITE_API_KEY || 
                 (import.meta as any).env.VITE_GEMINI_API_KEY ||
                 (process as any).env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("No API key found. Please ensure VITE_API_KEY_1 is set in your environment.");
  }

  const modelsToTry = [
    'gemini-3.1-flash-image-preview',
    'gemini-3-pro-image-preview',
    'gemini-2.5-flash-image'
  ];

  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

  // Try each model directly from the browser
  for (const modelName of modelsToTry) {
    try {
      const headShapes = ["a rounded square head", "an irregular blob-like head", "a slightly squarish head with soft corners"];
      const eyeStyles = ["two simple dot eyes", "two small circular eyes", "two short horizontal line eyes", "two small oval eyes", "two half-moon upward-curved eyes"];
      const mouthStyles = ["a gently smiling curve mouth", "a straight line mouth", "a slightly wavy line mouth", "a small U-shaped mouth", "a short dash mouth"];
      
      const randomHeadShape = headShapes[Math.floor(Math.random() * headShapes.length)];
      const randomEyeStyle = eyeStyles[Math.floor(Math.random() * eyeStyles.length)];
      const randomMouthStyle = mouthStyles[Math.floor(Math.random() * mouthStyles.length)];

      const prompt = `A unique, random Notion Faces style avatar, featuring ${randomHeadShape}, ${randomEyeStyle}, and ${randomMouthStyle}. The style is minimalist, abstract, with bold, clean black outlines. Shading achieved solely through stippling. Strictly pure black and pure white. NO colors. NO background circle, NO circular frame, NO border around the face. Just the face itself on a plain white background.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          },
        },
      });

      const imageData = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (imageData) {
        return { data: imageData, modelUsed: modelName };
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`Browser attempt failed for ${modelName}:`, error.message);
      // If it's a quota error, try the next model immediately
      continue;
    }
  }

  throw new Error(lastError?.message || "All models failed to generate.");
};
