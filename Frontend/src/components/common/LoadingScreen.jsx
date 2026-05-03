import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ message = "Loading your career journey...", showTimeoutMessage = true }) => {
  const [takingLong, setTakingLong] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTakingLong(true);
    }, 10000); // Show message after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      {/* Premium Animated Spinner */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-4 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-4 border-4 border-indigo-400 rounded-full border-b-transparent animate-spin-slow"></div>
      </div>

      <div className="mt-8 text-center px-4">
        <h2 className="text-xl font-semibold text-gray-800 animate-pulse">
          {message}
        </h2>
        
        {takingLong && showTimeoutMessage && (
          <div className="mt-4 animate-fade-in">
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              The server is waking up (Render cold start). This usually takes about a minute. Thanks for your patience!
            </p>
            <div className="mt-4 flex justify-center space-x-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-progress"></div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default LoadingScreen;
