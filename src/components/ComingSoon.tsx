import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export const ComingSoon: React.FC = () => {
  const { theme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 overflow-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950' 
        : 'bg-gradient-to-br from-white via-blue-50 to-indigo-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl opacity-20 animate-pulse ${
          theme === 'dark' ? 'bg-indigo-600' : 'bg-indigo-300'
        }`} style={{ animationDuration: '4s' }} />
        <div className={`absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-10 animate-pulse ${
          theme === 'dark' ? 'bg-blue-600' : 'bg-blue-300'
        }`} style={{ animationDuration: '5s', animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className={`w-full max-w-md relative z-10 transition-all duration-1000 ${
        isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
        
        {/* Animated Icon Container */}
        <div className="flex justify-center mb-12">
          <div className="relative w-24 h-24">
            {/* Outer Ring - Rotating */}
            <div className={`absolute inset-0 rounded-full border-3 animate-spin ${
              theme === 'dark' ? 'border-indigo-500' : 'border-indigo-400'
            }`} style={{ animationDuration: '3s', borderRightColor: 'transparent', borderTopColor: 'transparent' }} />
            
            {/* Middle Ring - Counter Rotating */}
            <div className={`absolute inset-3 rounded-full border-2 animate-spin ${
              theme === 'dark' ? 'border-blue-400' : 'border-blue-300'
            }`} style={{ 
              animationDuration: '4s', 
              animationDirection: 'reverse',
              borderLeftColor: 'transparent',
              borderBottomColor: 'transparent'
            }} />
            
            {/* Inner Pulsing Circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-4 h-4 rounded-full animate-pulse ${
                theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-500'
              }`} style={{ animationDuration: '2s' }} />
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-6 space-y-3">
          <h1 className={`text-4xl md:text-5xl font-bold transition-all duration-1000 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
          style={{ 
            animation: isLoaded ? 'slideUp 0.8s ease-out' : 'none',
            opacity: isLoaded ? 1 : 0
          }}>
            Coming Soon
          </h1>
          
          <p className={`text-xl md:text-2xl font-khmer font-semibold transition-all duration-1000 delay-200 ${
            theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'
          }`}
          style={{ 
            animation: isLoaded ? 'slideUp 0.8s ease-out 0.2s both' : 'none'
          }}>
            មានអ្វីថ្មីៗ មកដល់ពេលឆាប់ៗ
          </p>
        </div>

        {/* Description */}
        <div className={`text-center mb-10 p-6 rounded-2xl backdrop-blur-sm transition-all duration-1000 delay-300 ${
          theme === 'dark'
            ? 'bg-white/5 border border-white/10'
            : 'bg-white/40 border border-white/60'
        }`}
        style={{ 
          animation: isLoaded ? 'slideUp 0.8s ease-out 0.4s both' : 'none'
        }}>
          <p className={`font-khmer text-base leading-relaxed ${
            theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
          }`}>
            យើងកំពុងរៀបចំនូវមុខងារថ្មីៗដ៏ស្អាតសម្រាប់ការប្រើប្រាស់របស់អ្នក
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center items-center gap-3 mb-10"
        style={{ 
          animation: isLoaded ? 'slideUp 0.8s ease-out 0.6s both' : 'none'
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-500'
              }`}
              style={{
                animation: 'smoothBounce 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* Status Badge */}
        <div className={`text-center py-4 px-6 rounded-xl backdrop-blur-sm transition-all duration-1000 delay-700 ${
          theme === 'dark'
            ? 'bg-white/5 border border-indigo-500/30'
            : 'bg-indigo-100/30 border border-indigo-300/50'
        }`}
        style={{ 
          animation: isLoaded ? 'slideUp 0.8s ease-out 0.8s both' : 'none'
        }}>
          <p className={`font-khmer text-sm font-medium ${
            theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'
          }`}>
            ⏳ សូមរង់ចាំបន្តិចទៀត
          </p>
        </div>

        {/* Bottom Accent Line */}
        <div className="mt-10 h-1 rounded-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 animate-pulse"
        style={{ 
          animation: isLoaded ? 'fadeInPulse 1.5s ease-in-out 1s infinite' : 'none'
        }} />
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes smoothBounce {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
        }

        @keyframes fadeInPulse {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;
