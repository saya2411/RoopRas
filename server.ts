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
    
    // Pick one random key and one random model per request to keep it "Ultra-Light"
    const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    const model = modelsToTry[Math.floor(Math.random() * modelsToTry.length)];
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
      } else {
        throw new Error("No image data returned from Google.");
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      console.error(`Generation failed [Key: ${keySnippet}, Model: ${model}]: ${errorMessage}`);
      return res.status(500).json({ 
        error: "Generation failed. Please try again.", 
        details: errorMessage,
        tried: { model, key: keySnippet }
      });
    }
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
