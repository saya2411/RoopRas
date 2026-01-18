import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface GenerationResult {
  base64: string;
  promptUsed: string;
}

// --- Service Logic ---
const generateRandomNotionFace = async (): Promise<GenerationResult | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing from environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Feature Sets for Variation
  const headShapes = ["rounded square", "perfect circle", "soft organic blob", "slightly tapered oval", "rectangular with deep rounded corners"];
  const eyes = ["two tiny black dots", "hollow circular outlines", "short bold horizontal strokes", "closed eyes with upward curves", "simple oval outlines"];
  const mouths = ["a simple minimalist smile curve", "a perfectly straight horizontal dash", "a tiny 'u' shape", "a slightly wavy line", "a small circular 'o' shape"];
  const extras = ["none", "a small leaf on top", "a tiny rounded horn", "minimalist wavy hair outline", "a small abstract crown", "a single geometric antenna"];
  const flair = ["none", "a tiny floating star", "a small beauty mark", "a minimal triangular nose", "sparse stippled shading on the cheek"];

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const config = {
    head: pick(headShapes),
    eye: pick(eyes),
    mouth: pick(mouths),
    extra: pick(extras),
    flair: pick(flair)
  };

  const dynamicPrompt = `A minimalist Notion Faces style avatar. Features: ${config.head} head, ${config.eye} eyes, and ${config.mouth}. ${config.extra !== 'none' ? `Includes ${config.extra}.` : ''} ${config.flair !== 'none' ? `Subtle detail: ${config.flair}.` : ''} 
    Style: Bold clean black outlines, strictly pure black and pure white. Shading only via stippling. No gray. No color. Plain white background.`;

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: dynamicPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return {
        base64: response.generatedImages[0].image.imageBytes,
        promptUsed: dynamicPrompt
      };
    }
    return null;
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
};

// --- UI Components ---
const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateRandomNotionFace();
      if (result) {
        setImage(result.base64);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full max-w-md mx-auto">
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-8 flex flex-col items-center">
        
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-black mb-2 uppercase italic">RoopRas</h1>
          <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">The Essence of Form</p>
        </header>

        {/* Display Area */}
        <div className="relative group w-64 h-64 mb-8 bg-gray-50 border-2 border-black rounded-lg flex items-center justify-center overflow-hidden transition-all">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-black">Synthesizing...</span>
            </div>
          ) : image ? (
            <img 
              src={`data:image/png;base64,${image}`} 
              alt="Generated Avatar" 
              className="w-full h-full object-contain p-2 transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="text-center p-6">
              <div className="w-12 h-12 border-2 border-dashed border-gray-400 rounded-full mx-auto mb-4 opacity-50"></div>
              <p className="text-gray-400 text-xs font-medium italic">Your new identity is one click away.</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full space-y-4">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-4 px-6 border-2 border-black font-extrabold text-sm uppercase tracking-widest transition-all
              ${loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-white hover:text-black active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}
          >
            {loading ? 'Processing...' : 'Create New Roop'}
          </button>

          {image && !loading && (
            <a
              href={`data:image/png;base64,${image}`}
              download="roopras-avatar.png"
              className="flex items-center justify-center w-full py-3 px-6 bg-white border-2 border-black text-black font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              Export PNG
            </a>
          )}
        </div>

        {error && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-[10px] font-mono leading-tight">
            <span className="font-bold uppercase">System.Err:</span> {error}
          </div>
        )}
      </div>

      <footer className="mt-8 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
          Powered by Imagen 4.0 &bull; RoopRas v1.1
        </p>
      </footer>
    </main>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
