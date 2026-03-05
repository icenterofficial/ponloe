import express from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';
import cors from 'cors';
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const app = express();
const PORT = 3000;

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const isR2Configured = !!(process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME);

app.use(cors());
app.use(express.json());

// Set up multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// --- Telegram API Routes ---

const CHAT_ID = '-1003526327706';
const TOPICS = {
  images: 2,
  audios: 3,
  videos: 4,
  voice: 5,
  reels: 6,
  market: 7,
  book: 8
};

// Set up multer with limits
const uploadAudio = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadImage = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadVideo = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 600 * 1024 * 1024 } // 600MB
});

// Helper to handle multer errors
const handleUpload = (uploadMiddleware: any) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    uploadMiddleware(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'ឯកសារធំពេក សូមជ្រើសរើសទំហំតូចជាងនេះ (អតិបរមា: រូបភាព/សំឡេង 10MB, វីដេអូ 600MB)។' });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(500).json({ error: err.message });
      }
      next();
    });
  };
};

app.post('/api/upload', handleUpload(uploadAudio.single('audio')), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8601992984:AAHpH95jY-beedPVBJOHB_OesEKUlFjMmGI';

    if (!botToken) {
      return res.status(500).json({ error: 'Telegram credentials not configured' });
    }

    const isVoice = req.body.type === 'voice';
    const topicId = isVoice ? TOPICS.voice : TOPICS.audios;

    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('message_thread_id', topicId.toString());
    formData.append(isVoice ? 'voice' : 'audio', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const endpoint = isVoice ? 'sendVoice' : 'sendAudio';
    const response = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    const data: any = await response.json();

    if (!data.ok) {
      console.error('Telegram API Error:', data);
      return res.status(500).json({ error: 'Failed to upload to Telegram', details: data });
    }

    const fileId = isVoice ? data.result.voice.file_id : data.result.audio.file_id;
    const messageId = data.result.message_id;

    res.json({ success: true, fileId, messageId, chatId: CHAT_ID, topicId });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/upload-image', handleUpload(uploadImage.single('image')), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8601992984:AAHpH95jY-beedPVBJOHB_OesEKUlFjMmGI';

    if (!botToken) {
      return res.status(500).json({ error: 'Telegram credentials not configured' });
    }

    let topicId = TOPICS.images;
    if (req.body.topicType === 'market') topicId = TOPICS.market;
    if (req.body.topicType === 'book') topicId = TOPICS.book;

    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('message_thread_id', topicId.toString());
    formData.append('photo', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      body: formData,
    });

    const data: any = await response.json();

    if (!data.ok) {
      console.error('Telegram API Error:', data);
      return res.status(500).json({ error: 'Failed to upload to Telegram', details: data });
    }

    const photoArray = data.result.photo;
    const largestPhoto = photoArray[photoArray.length - 1];
    const fileId = largestPhoto.file_id;
    const messageId = data.result.message_id;

    res.json({ success: true, fileId, messageId, chatId: CHAT_ID, topicId });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/upload-video', handleUpload(uploadVideo.single('video')), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    if (isR2Configured) {
      const key = `videos/${Date.now()}-${file.originalname}`;
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      });
      await upload.done();
      const url = `${process.env.R2_PUBLIC_URL}/${key}`;
      return res.json({ success: true, url, type: 'r2' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8601992984:AAHpH95jY-beedPVBJOHB_OesEKUlFjMmGI';

    if (!botToken) {
      return res.status(500).json({ error: 'Telegram credentials not configured' });
    }

    const isReel = req.body.type === 'reel';
    const topicId = isReel ? TOPICS.reels : TOPICS.videos;

    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('message_thread_id', topicId.toString());
    formData.append('video', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendVideo`, {
      method: 'POST',
      body: formData,
    });

    const data: any = await response.json();

    if (!data.ok) {
      console.error('Telegram API Error (Video):', JSON.stringify(data, null, 2));
      return res.status(500).json({ error: `Telegram Error: ${data.description || 'Failed to upload video'}`, details: data });
    }

    const fileId = data.result.video.file_id;
    const messageId = data.result.message_id;

    res.json({ success: true, fileId, messageId, chatId: CHAT_ID, topicId });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/video/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8601992984:AAHpH95jY-beedPVBJOHB_OesEKUlFjMmGI';

    if (!botToken) {
      return res.status(500).json({ error: 'Telegram credentials not configured' });
    }

    const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    const fileData: any = await fileResponse.json();

    if (!fileData.ok) {
      return res.status(404).json({ error: 'File not found on Telegram' });
    }

    const filePath = fileData.result.file_path;
    const videoUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    
    // For video, we should ideally handle range requests, but for now we'll stream it directly
    // and let the browser handle it. To support seeking, we pass the range header if present.
    const fetchOptions: any = {};
    if (req.headers.range) {
      fetchOptions.headers = { Range: req.headers.range };
    }

    const videoStreamResponse = await fetch(videoUrl, fetchOptions);

    if (!videoStreamResponse.ok && videoStreamResponse.status !== 206) {
      return res.status(500).json({ error: 'Failed to stream video' });
    }

    // Forward headers
    res.status(videoStreamResponse.status);
    res.setHeader('Content-Type', videoStreamResponse.headers.get('content-type') || 'video/mp4');
    
    const contentLength = videoStreamResponse.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    
    const contentRange = videoStreamResponse.headers.get('content-range');
    if (contentRange) {
      res.setHeader('Content-Range', contentRange);
    }
    
    res.setHeader('Accept-Ranges', 'bytes');

    if (videoStreamResponse.body && typeof (videoStreamResponse.body as any).pipe === 'function') {
      (videoStreamResponse.body as any).pipe(res);
    } else if (videoStreamResponse.body) {
      const { Readable } = await import('stream');
      Readable.fromWeb(videoStreamResponse.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/audio/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8601992984:AAHpH95jY-beedPVBJOHB_OesEKUlFjMmGI';

    if (!botToken) {
      return res.status(500).json({ error: 'Telegram credentials not configured' });
    }

    // 1. Get file path from Telegram
    const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    const fileData: any = await fileResponse.json();

    if (!fileData.ok) {
      return res.status(404).json({ error: 'File not found on Telegram' });
    }

    const filePath = fileData.result.file_path;

    // 2. Stream the file back to the client
    const audioUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    const audioStreamResponse = await fetch(audioUrl);

    if (!audioStreamResponse.ok) {
      return res.status(500).json({ error: 'Failed to stream audio' });
    }

    // Forward headers
    res.setHeader('Content-Type', audioStreamResponse.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Content-Length', audioStreamResponse.headers.get('content-length') || '');
    res.setHeader('Accept-Ranges', 'bytes');

    if (audioStreamResponse.body && typeof (audioStreamResponse.body as any).pipe === 'function') {
      (audioStreamResponse.body as any).pipe(res);
    } else if (audioStreamResponse.body) {
      const { Readable } = await import('stream');
      Readable.fromWeb(audioStreamResponse.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/image/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8601992984:AAHpH95jY-beedPVBJOHB_OesEKUlFjMmGI';

    if (!botToken) {
      return res.status(500).json({ error: 'Telegram credentials not configured' });
    }

    // 1. Get file path from Telegram
    const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    const fileData: any = await fileResponse.json();

    if (!fileData.ok) {
      return res.status(404).json({ error: 'File not found on Telegram' });
    }

    const filePath = fileData.result.file_path;

    // 2. Stream the file back to the client
    const imageUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    const imageStreamResponse = await fetch(imageUrl);

    if (!imageStreamResponse.ok) {
      return res.status(500).json({ error: 'Failed to stream image' });
    }

    // Forward headers
    res.setHeader('Content-Type', imageStreamResponse.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Content-Length', imageStreamResponse.headers.get('content-length') || '');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache images for 1 year

    if (imageStreamResponse.body && typeof (imageStreamResponse.body as any).pipe === 'function') {
      (imageStreamResponse.body as any).pipe(res);
    } else if (imageStreamResponse.body) {
      const { Readable } = await import('stream');
      Readable.fromWeb(imageStreamResponse.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/quranenc/:translationKey/:surahNumber', async (req, res) => {
  try {
    const { translationKey, surahNumber } = req.params;
    const url = `https://quranenc.com/api/v1/translation/sura/${translationKey}/${surahNumber}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch from quranenc: ${response.statusText}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('QuranEnc Proxy Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/aladhan/calendar', async (req, res) => {
  try {
    const { year, month, latitude, longitude, method, school, adjustment } = req.query;
    const url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}&adjustment=${adjustment}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch from aladhan: ${response.statusText}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Aladhan Proxy Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/aladhan/gToHCalendar', async (req, res) => {
  try {
    const { month, year, method } = req.query;
    const url = `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}?method=${method}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch from aladhan: ${response.statusText}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Aladhan Proxy Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/nominatim/reverse', async (req, res) => {
  try {
    const { lat, lon, zoom, 'accept-language': acceptLanguage } = req.query;
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=${zoom}&accept-language=${acceptLanguage}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Ponloe.org/3.4 (creative.ponloe.org@gmail.com)'
      }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch from nominatim: ${response.statusText}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Nominatim Proxy Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// --- Vite Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
