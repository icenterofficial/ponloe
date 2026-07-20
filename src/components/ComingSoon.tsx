import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export const ComingSoon: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === 'dark' ? 'bg-slate-950' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="text-center px-6 max-w-md">
        {/* Animated Logo Container */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-indigo-500 animate-spin"
                   style={{ animationDuration: '3s' }}>
              </div>
              
              {/* Middle pulsing ring */}
              <div className="absolute inset-2 rounded-full border-2 border-indigo-300 animate-pulse"
                   style={{ animationDuration: '2s' }}>
              </div>
              
              {/* Inner icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">🕌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Text */}
        <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
          theme === 'dark' 
            ? 'text-white' 
            : 'bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent'
        }`}>
          Coming Soon
        </h1>

        {/* Subtitle with animation */}
        <p className={`text-lg md:text-xl mb-6 font-khmer animate-pulse ${
          theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
        }`}>
          ការងារដ៏សម្រស់ថ្មីៗកំពុងរៀបចំ...
        </p>

        {/* Loading dots animation */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>

        {/* Description */}
        <p className={`text-sm md:text-base mb-8 ${
          theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
        }`}>
          យើងកំពុងបង្កើតបទពិសោធន៍ដ៏អស្ចារ្យសម្រាប់អ្នក។ សូមរង់ចាំបន្តិចទៀត។
        </p>

        {/* Optional: Counter or Progress */}
        <div className={`inline-block px-6 py-3 rounded-full ${
          theme === 'dark'
            ? 'bg-slate-800 border border-slate-700'
            : 'bg-white/50 backdrop-blur border border-white'
        }`}>
          <p className={`text-sm font-medium ${
            theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
          }`}>
            ⏰ ស្ថិតនៅក្នុងដំណើរការ
          </p>
        </div>

        {/* Floating particles (optional decorative) */}
        <div className="mt-12 flex justify-center gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse"
              style={{
                opacity: 0.5 + Math.random() * 0.5,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
