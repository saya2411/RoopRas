import { GoogleGenAI, GenerateImagesResponse, GenerateContentResponse } from "@google/genai";

/**
 * Generates a random Notion Faces-style avatar.
 */
export const generateRandomNotionFace = async (): Promise<string | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const headShapes = ["a rounded square head", "a circular head", "an irregular blob-like head", "a slightly squarish head with soft corners"];
  const eyeStyles = ["two simple dot eyes", "two small circular eyes", "two short horizontal line eyes", "two small oval eyes", "two half-moon upward-curved eyes"];
  const mouthStyles = ["a gently smiling curve mouth", "a straight line mouth", "a slightly wavy line mouth", "a small U-shaped mouth", "a short dash mouth"];
  
  const randomHeadShape = headShapes[Math.floor(Math.random() * headShapes.length)];
  const randomEyeStyle = eyeStyles[Math.floor(Math.random() * eyeStyles.length)];
  const randomMouthStyle = mouthStyles[Math.floor(Math.random() * mouthStyles.length)];

  const prompt = `A unique, random Notion Faces style avatar, featuring ${randomHeadShape}, ${randomEyeStyle}, and ${randomMouthStyle}. The style is minimalist, abstract, with bold, clean black outlines. Shading achieved solely through stippling. Strictly pure black and pure white. NO colors.`;

  try {
    const response: GenerateImagesResponse = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Transforms an uploaded image into Studio Ghibli style.
 */
export const transformToGhibli = async (base64Image: string, mimeType: string): Promise<string | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prompt specifically tuned for Ghibli aesthetic
  const prompt = `Redraw this person in the iconic Studio Ghibli anime style. 
    Characteristics: Soft, warm color palette, hand-painted aesthetic, expressive eyes, characteristic small nose and mouth. 
    Maintain the person's core features like hair style and glasses but render them in a whimsical, cinematic Ghibli film character style. 
    The background should be a soft, out-of-focus lush green meadow or a cozy interior.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
    });

    // Iterate through parts to find the image response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return null;
  } catch (error) {
    console.error("Ghibli Transform Error:", error);
    throw new Error(`Ghibli transformation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};
