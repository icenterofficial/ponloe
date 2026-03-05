const BOT_TOKEN = '8257808380:AAGrVLSaXFRntM1gdLSXz3LAEwSAIzuM1G0';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const getTelegramUpdates = async (offset?: number) => {
  try {
    const offsetParam = offset ? `&offset=${offset}` : '';
    const res = await fetch(`${API_URL}/getUpdates?timeout=10${offsetParam}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching Telegram updates:', error);
    return { ok: false, result: [] };
  }
};

export const sendTelegramMessage = async (chatId: number, text: string) => {
  try {
    const res = await fetch(`${API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text, 
        parse_mode: 'HTML' 
      })
    });
    return await res.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return { ok: false };
  }
};
