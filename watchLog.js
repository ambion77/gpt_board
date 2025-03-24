import fs from 'fs';
import chokidar from 'chokidar';  // 파일 시스템 이벤트 감시
import TelegramBot from 'node-telegram-bot-api';  // 텔레그램 봇 API

const logFilePath = './app.log'; // app.log 파일 경로

const TOKEN = `${process.env.VITE_TELEGRAM_BOT_API_KEY}`; // BotFather에서 받은 토큰
const CHAT_ID = `${process.env.VITE_TELEGRAM_CHAT_ID}`; // 메시지를 받을 채팅 ID

const bot = new TelegramBot(TOKEN, { polling: false });

async function sendTelegramMessage(message) {
  try {
    await bot.sendMessage(CHAT_ID, message);
    console.log("✅ Telegram 메시지 전송 성공!");
  } catch (error) {
    console.error("❌ 메시지 전송 실패:", error);
  }
}

// 로그 파일 감시
const watchLog = chokidar.watch(logFilePath, {
  persistent: true,
});

// 파일이 변경될 때마다 이벤트 발생
watchLog.on('change', (path) => {
  console.log(`File ${path} has been changed`);

  // 파일에서 마지막 줄 읽기
  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading log file:', err);
      return;
    }

    // 로그 파일의 마지막 줄 가져오기
    const lines = data.trim().split('\n');
    const lastLine = lines[lines.length - 1];

    // Telegram으로 메시지 전송
    sendTelegramMessage(lastLine);
  });
});

console.log(`Watching for changes in ${logFilePath}...`);

export default watchLog;