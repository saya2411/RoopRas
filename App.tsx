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
  const [recentRoops, setRecentRoops] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
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
    setErrorDetails(null);
    try {
      const result = await generateRandomNotionFace();
      if (result && result.data) {
        setResultImage(result.data);
        setRecentRoops((prev) => {
          if (prev[0] === result.data) return prev;
          return [result.data, ...prev].slice(0, 5);
        });
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      
      let friendlyMessage = err.message || "Failed to generate.";
      
      if (friendlyMessage.toLowerCase().includes("permission") || friendlyMessage.includes("403")) {
        friendlyMessage = "Permission Denied. Please make sure you are logged into your Google Account to use this shared app, or try a different browser.";
      } else if (friendlyMessage.toLowerCase().includes("quota") || friendlyMessage.includes("429")) {
        friendlyMessage = "The daily limit for this app has been reached. Please try again later.";
      } else if (friendlyMessage.toLowerCase().includes("region")) {
        friendlyMessage = "Image generation might not be available in your current region yet.";
      }

      setError(friendlyMessage);
      if (err.details || err.tried) {
        setErrorDetails({
          details: err.details,
          tried: err.tried
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const selectFromGallery = (img: string) => {
    setResultImage(img);
    setShowGallery(false);
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

          {recentRoops.length > 0 && (
            <button
              onClick={() => setShowGallery(true)}
              className="w-full py-3 border-2 border-black text-black font-bold text-[10px] uppercase tracking-widest bg-white hover:bg-gray-50 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
            >
              Recent Roops
            </button>
          )}
        </div>

        {showGallery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
              <button 
                onClick={() => setShowGallery(false)}
                className="absolute top-4 right-4 w-8 h-8 border-2 border-black flex items-center justify-center font-black hover:bg-black hover:text-white transition-colors"
              >
                &times;
              </button>
              
              <h3 className="text-xl font-black uppercase tracking-tighter mb-8 italic">Recent Roops</h3>
              
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {recentRoops.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 border-2 border-black rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-20 h-20 border-2 border-black rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img 
                        src={`data:image/png;base64,${img}`} 
                        className="w-full h-full object-cover" 
                        alt={`Recent ${idx}`} 
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <button
                        onClick={() => selectFromGallery(img)}
                        className="text-[10px] font-black uppercase tracking-widest text-left hover:underline"
                      >
                        View in Main
                      </button>
                      <a
                        href={`data:image/png;base64,${img}`}
                        download={`roopras-${idx}.png`}
                        className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowGallery(false)}
                className="w-full mt-8 py-4 border-2 border-black bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
              >
                Close Gallery
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-600 text-[10px] font-mono leading-tight w-full overflow-hidden">
            <div className="font-bold uppercase mb-1">ERROR: {error}</div>
            {error.includes("Permission Denied") && (
              <div className="mt-2 font-bold text-red-800 animate-pulse">
                TIP: Try logging into your Google Account and refreshing the page!
              </div>
            )}
            {errorDetails && (
              <div className="opacity-70 mt-2 space-y-1">
                {errorDetails.tried && (
                  <div>TRIED: {errorDetails.tried.model} (Key: {errorDetails.tried.key})</div>
                )}
                {errorDetails.details && (
                  <div className="break-words">DETAILS: {errorDetails.details}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="mt-12 text-center pb-12 px-4">
        <p className="text-[9px] text-gray-400 uppercase tracking-[0.4em] font-black opacity-60 mb-3">
          RoopRas v1.3 &bull; Minimalist Generative Interface
        </p>
        <p className="text-[8px] text-gray-400 max-w-xs mx-auto leading-relaxed opacity-40">
          Note: Standard security warnings on shared links are a platform feature of AI Studio. 
          This app is safe and uses official Google Gemini models.
        </p>
      </footer>
    </main>
  );
};

export default App;
