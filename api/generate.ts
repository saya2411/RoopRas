import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { modelName } = req.body;
  
  // Collect all possible keys from environment variables
  const apiKeys = [
    process.env.VITE_API_KEY_1,
    process.env.VITE_API_KEY_2,
    process.env.VITE_API_KEY_3,
    process.env.VITE_API_KEY,
    process.env.API_KEY,
    process.env.GEMINI_API_KEY
  ].filter(k => k && typeof k === 'string' && k.length > 5);

  if (apiKeys.length === 0) {
    return res.status(500).json({ error: "No valid API keys found on server." });
  }

  const modelsToTry = [modelName, 'gemini-3.1-flash-image-preview'];
  let lastError: any = null;

  // Try each key
  for (let apiKey of apiKeys) {
    for (const model of modelsToTry) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        const headShapes = ["a rounded square head", "an irregular blob-like head", "a slightly squarish head with soft corners"];
        const eyeStyles = ["two simple dot eyes", "two small circular eyes", "two short horizontal line eyes", "two small oval eyes", "two half-moon upward-curved eyes"];
        const mouthStyles = ["a gently smiling curve mouth", "a straight line mouth", "a slightly wavy line mouth", "a small U-shaped mouth", "a short dash mouth"];
        
        const randomHeadShape = headShapes[Math.floor(Math.random() * headShapes.length)];
        const randomEyeStyle = eyeStyles[Math.floor(Math.random() * eyeStyles.length)];
        const randomMouthStyle = mouthStyles[Math.floor(Math.random() * mouthStyles.length)];

        const prompt = `A unique, random Notion Faces style avatar, featuring ${randomHeadShape}, ${randomEyeStyle}, and ${randomMouthStyle}. The style is minimalist, abstract, with bold, clean black outlines. Shading achieved solely through stippling. Strictly pure black and pure white. NO colors. NO background circle, NO circular frame, NO border around the face. Just the face itself on a plain white background.`;

        const response = await ai.models.generateContent({
          model: model,
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
          return res.json({ data: imageData });
        }
      } catch (error: any) {
        lastError = error;
        const errorMessage = error?.message || String(error);
        console.warn(`Server-side attempt failed: ${errorMessage}`);
        // Continue to next model/key
      }
    }
  }

  res.status(429).json({ error: "All server-side keys exhausted.", details: lastError?.message });
}
