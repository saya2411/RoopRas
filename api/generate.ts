import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const keys = [
      process.env.VITE_API_KEY_1,
      process.env.VITE_API_KEY_2,
      process.env.VITE_API_KEY_3,
      process.env.VITE_API_KEY,
      process.env.API_KEY,
      process.env.GEMINI_API_KEY
    ].map((k, i) => ({
      name: `Key_${i + 1}`,
      present: !!k,
      length: k?.length || 0
    }));
    
    return res.json({ 
      env: process.env.NODE_ENV,
      keysFound: keys.filter(k => k.present).length,
      details: keys
    });
  }

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

  const modelsToTry = [
    'gemini-3.1-flash-image-preview',
    'gemini-3-pro-image-preview',
    'gemini-2.5-flash-image'
  ];
  
  let lastError: any = null;
  
  // Try up to 3 different combinations in one request
  for (let attempt = 0; attempt < 3; attempt++) {
    const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    const model = modelsToTry[attempt % modelsToTry.length];
    const keySnippet = apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);

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
        return res.json({ data: imageData, modelUsed: model });
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1} failed [${model}]: ${error.message}`);
      // Wait 1 second before trying the next combination
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const errorMessage = lastError?.message || "All attempts failed.";
  return res.status(500).json({ 
    error: "Generation failed. Google is currently restricting this region.", 
    details: errorMessage,
    tried: "Multiple models and keys"
  });
}
