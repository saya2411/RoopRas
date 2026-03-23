import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateRandomNotionFace } from './services/geminiService';

const LOADING_STEPS = [
  'Adding Primer...',
  'Applying Foundation...',
  'Blending Concealer...',
  'Setting Powder...',
  'Adding Lip Tint...',
  'Defining Brows...',
  'Final Glow...',
];

const App: React.FC = () => {
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleProcess = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateRandomNotionFace('gemini-2.5-flash-image');
      if (res) setResultImage(res);
    } catch (err: unknown) {
      console.error("Generation error:", err);
      if (err instanceof Error) {
        setError(`Failed to generate: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full max-w-xl mx-auto px-4">
      <div className="bg-white border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8 flex flex-col items-center">
        
        <header className="text-center mb-10 w-full">
          <h1 className="text-5xl font-black tracking-tighter text-black mb-2 italic">RoopRas</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mb-8">The Essence of Form</p>
        </header>

        <div className="w-full mb-10 flex flex-col items-center">
          <div className="flex flex-col items-center w-full max-w-[320px]">
            <h2 className="text-xs font-black uppercase mb-4 tracking-widest text-gray-400">The Result</h2>
            <div className="w-full aspect-square border-2 border-black rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
              {loading ? (
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : resultImage ? (
                <img 
                  src={`data:image/png;base64,${resultImage}`} 
                  className="w-full h-full object-contain" 
                  alt="RoopResult" 
                />
              ) : (
                <div className="text-gray-300 italic text-sm text-center px-4">Awaiting creation...</div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full space-y-4">
          <button
            onClick={handleProcess}
            disabled={loading}
            className={`w-full py-5 border-2 border-black font-black text-sm uppercase tracking-widest transition-all
              ${loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed translate-y-1 shadow-none'
                : 'bg-black text-white hover:bg-white hover:text-black active:translate-y-1 active:shadow-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
              }`}
          >
            {loading ? LOADING_STEPS[loadingStep] : 'Create New Roop'}
          </button>

          {resultImage && !loading && (
            <div className="flex gap-4">
              <a
                href={`data:image/png;base64,${resultImage}`}
                download="roopras.png"
                className="flex-1 text-center py-3 border-2 border-black text-black font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none bg-white" 
              >
                Download Export
              </a>
              <button 
                onClick={() => setResultImage(null)}
                className="px-6 py-3 border-2 border-black text-black font-bold text-[10px] uppercase tracking-widest bg-gray-100 hover:bg-white"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-600 text-[10px] font-mono leading-tight w-full">
            <span className="font-bold uppercase">ERROR:</span> {error}
          </div>
        )}
      </div>

      <footer className="mt-12 text-center pb-12">
        <p className="text-[9px] text-gray-400 uppercase tracking-[0.4em] font-black opacity-60">
          RoopRas v1.3 &bull; Minimalist Generative Interface
        </p>
      </footer>
    </main>
  );
};

export default App;
