import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Generates a random Notion Faces-style avatar.
 */
// Keep track of the last successful key index across calls
let currentKeyIndex = 0;

export const generateRandomNotionFace = async (modelName: string): Promise<string | null> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ modelName }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to generate on server.");
    }

    return result.data;
  } catch (error: any) {
    console.error("Client-side error calling server API:", error);
    throw error;
  }
};
