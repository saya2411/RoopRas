import React, { useState, useCallback } from 'react';
import { generateRandomNotionFace } from './services/geminiService';

const App: React.FC = () => {
  const [notionFaceBase64, setNotionFaceBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateClick = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotionFaceBase64(null);

    try {
      const result = await generateRandomNotionFace();
      if (result) {
        setNotionFaceBase64(result);
      } else {
        setError('No image was returned. Please try again.');
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(`Failed to generate: ${err.message || 'An unknown error occurred.'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] bg-white rounded-lg shadow-xl p-6 md:p-8 lg:p-10 w-full max-w-xl">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 text-center italic">
        RoopRas
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Click below to generate a unique, minimalist "Roop" (form) using our generative essence.
      </p>

      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
              <p className="mt-2 text-gray-500 text-sm font-bold uppercase tracking-widest">Synthesizing...</p>
            </div>
          ) : notionFaceBase64 ? (
            <img
              src={`data:image/png;base64,${notionFaceBase64}`}
              alt="RoopRas Face"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <span className="text-gray-400 text-center p-4 italic">Click "Generate" to create a Roop</span>
          )}
        </div>
        <button
          onClick={handleGenerateClick}
          disabled={loading}
          className={`mt-6 px-8 py-4 font-extrabold uppercase tracking-widest rounded-none border-2 border-black transition-all
            ${loading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-black text-white hover:bg-white hover:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1'
            }`}
        >
          {loading ? 'Processing...' : 'Generate New Roop'}
        </button>

        {notionFaceBase64 && !loading && (
          <a
            href={`data:image/png;base64,${notionFaceBase64}`}
            download="roopras-face.png"
            className="mt-4 text-xs font-bold uppercase tracking-widest underline hover:text-gray-600 transition-colors"
          >
            Download PNG
          </a>
        )}
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg w-full max-w-md text-center text-xs font-mono">
          <p className="font-bold">ERROR:</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default App;