import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Debug endpoint to check keys
  app.get("/api/debug", (req, res) => {
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
    
    res.json({ 
      env: process.env.NODE_ENV,
      keysFound: keys.filter(k => k.present).length,
      details: keys
    });
  });

  // API Route for Image Generation
  app.post("/api/generate", async (req, res) => {
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
      'gemini-2.5-flash-image',
      'gemini-3-pro-image-preview'
    ];
    
    // Shuffle keys to avoid hitting the same one first every time
    const shuffledKeys = [...apiKeys].sort(() => Math.random() - 0.5);
    
    let lastError: any = null;
    const debugInfo: any[] = [];

    // Try each key
    for (let i = 0; i < shuffledKeys.length; i++) {
      const apiKey = shuffledKeys[i];
      const keySnippet = apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);

      for (const model of modelsToTry) {
        try {
          // Add a longer random delay (500-1000ms) to look even more human
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
          
          const ai = new GoogleGenAI({ apiKey });
          
          const headShapes = ["a rounded square head", "an irregular blob-like head", "a slightly squarish head with soft corners"];
          const eyeStyles = ["two simple dot eyes", "two small circular eyes", "two short horizontal line eyes", "two small oval eyes", "two half-moon upward-curved eyes"];
          const mouthStyles = ["a gently smiling curve mouth", "a straight line mouth", "a slightly wavy line mouth", "a small U-shaped mouth", "a short dash mouth"];
          
          const randomHeadShape = headShapes[Math.floor(Math.random() * headShapes.length)];
          const randomEyeStyle = eyeStyles[Math.floor(Math.random() * eyeStyles.length)];
          const randomMouthStyle = mouthStyles[Math.floor(Math.random() * mouthStyles.length)];

          // Try a slightly simpler prompt if we've already failed once
          const prompt = lastError 
            ? `A minimalist Notion-style avatar face, black and white, simple lines, stippling shading.`
            : `A unique, random Notion Faces style avatar, featuring ${randomHeadShape}, ${randomEyeStyle}, and ${randomMouthStyle}. The style is minimalist, abstract, with bold, clean black outlines. Shading achieved solely through stippling. Strictly pure black and pure white. NO colors. NO background circle, NO circular frame, NO border around the face. Just the face itself on a plain white background.`;

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
          const errorMessage = error?.message || String(error);
          debugInfo.push({ key: keySnippet, model, error: errorMessage });
          console.warn(`Server attempt failed [Key ${i+1}, Model ${model}]: ${errorMessage}`);
        }
      }
    }

    res.status(429).json({ 
      error: "All server-side keys and models exhausted.", 
      details: lastError?.message,
      debug: debugInfo 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
