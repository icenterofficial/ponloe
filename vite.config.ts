import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const geminiApiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: true,
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(geminiApiKey || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey || ''),
        'process.env.APP_URL': JSON.stringify(process.env.APP_URL || env.APP_URL || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
