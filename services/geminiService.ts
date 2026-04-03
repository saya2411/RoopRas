import { GoogleGenAI } from "@google/genai";

/**
 * Generates a random Notion Faces-style avatar.
 */
export const generateRandomNotionFace = async (): Promise<any> => {
  // Use the built-in Gemini API key provided by the AI Studio environment
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key not found. If you are running this outside of AI Studio, please set the GEMINI_API_KEY environment variable.");
  }

  const modelsToTry = [
    'gemini-3.1-flash-image-preview',
    'gemini-3-pro-image-preview',
    'gemini-2.5-flash-image'
  ];

  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

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
      const msg = error.message?.toLowerCase() || "";
      console.warn(`Attempt failed for ${modelName}:`, msg);
      continue;
    }
  }

  throw new Error(lastError?.message || "All models failed to generate.");
};
