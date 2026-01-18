import React, { useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { generateRandomNotionFace, transformToGhibli } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<'notion' | 'ghibli'>('notion');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'notion') {
        const res = await generateRandomNotionFace();
        if (res) setResultImage(res);
      } else {
        if (!uploadPreview) {
          setError("Please upload an image first.");
          setLoading(false);
          return;
        }
        // Extract base64 and mime type
        const matches = uploadPreview.match(/^data:(.+);base64,(.+)$/);
        if (!matches) throw new Error("Invalid image data");
        const mimeType = matches[1];
        const base64Data = matches[2];
        const res = await transformToGhibli(base64Data, mimeType);
        if (res) setResultImage(res);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (newMode: 'notion' | 'ghibli') => {
    setMode(newMode);
    setResultImage(null);
    setUploadPreview(null);
    setError(null);
  };

  return (
    <main className="w-full max-w-xl mx-auto px-4">
      <div className="bg-white border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8 flex flex-col items-center">
        
        <header className="text-center mb-10 w-full">
          <h1 className="text-5xl font-black tracking-tighter text-black mb-2 italic">RoopRas</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mb-8">The Essence of Form</p>
          
          <div className="flex bg-gray-100 p-1 rounded-xl border-2 border-black inline-flex">
            <button 
              onClick={() => toggleMode('notion')}
              className={`px-6 py-2 rounded-lg font-bold text-xs uppercase transition-all ${mode === 'notion' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}
            >
              Minimalist
            </button>
            <button 
              onClick={() => toggleMode('ghibli')}
              className={`px-6 py-2 rounded-lg font-bold text-xs uppercase transition-all ${mode === 'ghibli' ? 'bg-[#FF9B9B] text-black border border-black shadow-md' : 'text-gray-500 hover:text-black'}`}
            >
              Ghibli Transform
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-10">
          {/* Input/Upload Area */}
          <div className="flex flex-col items-center">
            <h2 className="text-xs font-black uppercase mb-4 tracking-widest text-gray-400">
              {mode === 'notion' ? 'Source' : 'Upload Photo'}
            </h2>
            <div 
              onClick={() => mode === 'ghibli' && fileInputRef.current?.click()}
              className={`w-full aspect-square border-2 border-black rounded-xl flex items-center justify-center overflow-hidden relative cursor-pointer group transition-all
                ${mode === 'ghibli' ? 'bg-white hover:bg-gray-50 border-dashed' : 'bg-gray-50 cursor-default'}
              `}
            >
              {mode === 'notion' ? (
                <div className="text-center p-8 text-gray-300 italic text-sm">Random Seed Active</div>
              ) : uploadPreview ? (
                <img src={uploadPreview} className="w-full h-full object-cover" alt="Upload" />
              ) : (
                <div className="text-center p-8 space-y-2">
                  <div className="w-10 h-10 border-2 border-black rounded-full mx-auto flex items-center justify-center">+</div>
                  <p className="text-[10px] font-bold uppercase text-black">Click to Upload</p>
                </div>
              )}
              {mode === 'ghibli' && (
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              )}
            </div>
          </div>

          {/* Output Area */}
          <div className="flex flex-col items-center">
            <h2 className="text-xs font-black uppercase mb-4 tracking-widest text-gray-400">The Result</h2>
            <div className={`w-full aspect-square border-2 border-black rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]`}>
              {loading ? (
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-[10px] font-black uppercase animate-pulse">Painting...</p>
                </div>
              ) : resultImage ? (
                <img 
                  src={`data:image/png;base64,${resultImage}`} 
                  className="w-full h-full object-contain" 
                  alt="RoopResult" 
                />
              ) : (
                <div className="text-gray-300 italic text-sm">Awaiting creation...</div>
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
            {loading ? 'Synthesizing...' : mode === 'notion' ? 'Create New Roop' : 'Ghiblify Me'}
          </button>

          {resultImage && !loading && (
            <div className="flex gap-4">
              <a
                href={`data:image/png;base64,${resultImage}`}
                download={`roopras-${mode}.png`}
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
          RoopRas v1.2 &bull; Multi-Model Generative Interface
        </p>
      </footer>
    </main>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
