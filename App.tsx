import React, { useState, useCallback } from 'react';
import { generateRandomNotionFace } from './services/geminiService'; // Renamed import

const App: React.FC = () => {
  const [notionFaceBase64, setNotionFaceBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateClick = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotionFaceBase64(null); // Clear previous generated image

    try {
      const result = await generateRandomNotionFace(); // Call the new generation function
      if (result) {
        setNotionFaceBase64(result);
      } else {
        setError('No Faces style image was returned. Please try again.');
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(`Failed to generate image: ${err.message || 'An unknown error occurred.'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] bg-white rounded-lg shadow-xl p-6 md:p-8 lg:p-10 w-full max-w-xl">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 text-center">
        Random Faces Generator
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Click the button to generate a unique, minimalist, black and white Faces style avatar!
      </p>

      <div className="flex flex-col items-center justify-center w-full">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Face</h2>
        <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500 text-sm">Generating...</p>
            </div>
          ) : notionFaceBase64 ? (
            <img
              src={`data:image/png;base64,${notionFaceBase64}`} // Assuming output is typically PNG
              alt="Notion Face"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <span className="text-gray-400 text-center p-4">Click "Generate" to create a Face</span>
          )}
        </div>
        <button
          onClick={handleGenerateClick}
          disabled={loading}
          className={`mt-6 px-6 py-3 font-semibold rounded-full shadow-md transition duration-200 ease-in-out
            ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
        >
          {loading ? 'Generating...' : 'Generate Random Face'}
        </button>

        {notionFaceBase64 && !loading && (
          <a
            href={`data:image/png;base64,${notionFaceBase64}`}
            download="notion-face-image.png"
            className="mt-4 px-6 py-3 bg-gray-800 text-white font-semibold rounded-full shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 transition duration-200 ease-in-out"
          >
            Download Face
          </a>
        )}
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg w-full max-w-md text-center">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default App;