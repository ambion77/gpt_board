import TelegramBot from 'node-telegram-bot-api';
import pool from './db.js'; // Import your database connection

const TOKEN = `${process.env.VITE_TELEGRAM_BOT_API_KEY}`; // BotFather에서 받은 토큰
const bot = new TelegramBot(TOKEN, { polling: true }); // Enable polling

// Listen for incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id; // Telegram user ID
  const username = msg.from.username; // Telegram username

  console.log(`✅ Received message from user: ${username} (ID: ${userId}, Chat ID: ${chatId})`);
});

export async function sendTelegramMessage(chatId, message) {
  try {
    await bot.sendMessage(chatId, message);
    console.log(`✅ Telegram 메시지 전송 성공! (Chat ID: ${chatId})`);
  } catch (error) {
    console.error(`❌ 메시지 전송 실패 (Chat ID: ${chatId}):`, error);
    throw error; // 에러를 다시 던져서 호출 측에서 처리하도록 함
  }
}
