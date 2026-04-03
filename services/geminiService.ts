import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Generates a random Notion Faces-style avatar.
 */
// Keep track of the last successful key index across calls
let currentKeyIndex = 0;

export const generateRandomNotionFace = async (): Promise<any> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const result = await response.json();

    if (!response.ok) {
      // Create a rich error object
      const error: any = new Error(result.error || "Failed to generate on server.");
      error.details = result.details;
      error.tried = result.tried;
      throw error;
    }

    return result;
  } catch (error: any) {
    console.error("Client-side error calling server API:", error);
    throw error;
  }
};
