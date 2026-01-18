import { GoogleGenAI, GenerateImagesResponse } from "@google/genai";

/**
 * Generates a random Notion Faces-style avatar using the Gemini API (Imagen model).
 * The generation strictly adheres to a black and white, minimalist aesthetic.
 * @returns A Promise that resolves to the base64 encoded string of the Notion Faces-style image, or null if not found.
 */
export const generateRandomNotionFace = async (
): Promise<string | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not set. Please ensure it's configured.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Define arrays of possible minimalist features for variation
  const headShapes = ["a rounded square head", "a circular head", "an irregular blob-like head", "a slightly squarish head with soft corners"];
  const eyeStyles = ["two simple dot eyes", "two small circular eyes", "two short horizontal line eyes", "two small oval eyes", "two half-moon upward-curved eyes"];
  const mouthStyles = ["a gently smiling curve mouth", "a straight line mouth", "a slightly wavy line mouth", "a small U-shaped mouth", "a short dash mouth"];
  const topAccessories = ["no hair or accessory", "a small abstract leaf on top", "a single spike on top", "a small cloud shape on top", "a simple wavy hair outline", "a tiny, rounded horn"];
  const uniqueDetails = ["", "a tiny triangular nose", "a small question mark floating near the head", "a small star pattern on its cheek", "a small abstract geometric pattern on its forehead", "a single teardrop shape under one eye"]; // Less frequent, subtle details

  // Randomly select one option from each category
  const randomHeadShape = headShapes[Math.floor(Math.random() * headShapes.length)];
  const randomEyeStyle = eyeStyles[Math.floor(Math.random() * eyeStyles.length)];
  const randomMouthStyle = mouthStyles[Math.floor(Math.random() * mouthStyles.length)];
  const randomTopAccessory = topAccessories[Math.floor(Math.random() * topAccessories.length)];
  const randomUniqueDetail = uniqueDetails[Math.floor(Math.random() * uniqueDetails.length)];

  // Construct a dynamic prompt combining the random selections with the core style constraints
  const prompt = `A unique, random Notion Faces style avatar, featuring ${randomHeadShape}, ${randomEyeStyle}, and ${randomMouthStyle}. ${randomTopAccessory !== "no hair or accessory" ? `It has ${randomTopAccessory}.` : ''} ${randomUniqueDetail}. The style is minimalist, abstract, with bold, clean black outlines. Any shading or perceived mid-tones must be achieved solely through sparse or dense stippling (halftone dot patterns). Strictly pure black and pure white, with a plain pure white background. NO colors, NO gradients, NO shades of gray. Maintain a friendly and minimalist expression, adhering to the iconic, graphic Notion Faces aesthetic.`;

  try {
    const response: GenerateImagesResponse = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001', // Using Imagen model for stricter control over output properties
      prompt: prompt, // Dynamic prompt for varied output
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png', // PNG is suitable for line art and black & white images
        aspectRatio: '1:1', // Notion Faces are typically square
        colorPalette: 'BLACK_AND_WHITE', // Explicitly enforce monochrome output
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes; // Return the base64 data of the generated image
    }
    return null; // No image part found in the response
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : String(error)}`);
  }
};