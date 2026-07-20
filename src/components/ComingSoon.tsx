import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export const ComingSoon: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'dark' ? 'bg-slate-950' : 'bg-white'
    }`}>
      <div className="w-full max-w-md">
        {/* Animated Icon Container */}
        <div className="flex justify-center mb-12">
          <div className="relative w-20 h-20">
            {/* Animated concentric circles */}
            <div className="absolute inset-0 rounded-full border-3 border-indigo-200 animate-pulse" />
            <div className="absolute inset-2 rounded-full border-2 border-indigo-400 animate-spin" 
                 style={{ animationDuration: '2.5s' }} />
            
            {/* Center dot with pulsing effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl md:text-4xl font-bold mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Coming Soon
          </h1>
          
          <p className={`text-lg font-khmer ${
            theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'
          }`}>
            ការងារដ៏សម្រស់ថ្មីៗកំពុងរៀបចំ
          </p>
        </div>

        {/* Description */}
        <p className={`text-center mb-10 leading-relaxed ${
          theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
        }`}>
          យើងកំពុងងាក់ក្បាលធ្វើការដើម្បីនាំមកនូវការប្រលង្ខិតប្រលង្ខង់ដ៏ល្អប្រសើរសម្រាប់អ្នក។
        </p>

        {/* Loading Indicator */}
        <div className="flex justify-center items-center gap-2 mb-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-500"
              style={{
                animation: 'bounce 1.4s infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Status Badge */}
        <div className={`text-center py-4 px-6 rounded-lg ${
          theme === 'dark'
            ? 'bg-slate-900 border border-slate-800'
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <p className={`text-sm font-medium ${
            theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
          }`}>
            ⏳ ស្ថិតនៅក្នុងដំណើរការ
          </p>
        </div>

        <style>{`
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
              opacity: 0.5;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ComingSoon;
