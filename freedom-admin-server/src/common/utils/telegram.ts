import TelegramBot from 'node-telegram-bot-api';
const prodToken = '5057168818:AAEiHcfNWfZMVoSEMJ46eSRJRIUvYVzL_-8';
// 测试环境机器人
const devEnvToken = '5090150346:AAH_CY8dapHa-4pP6Gisu41JdrVf8YhAFds';

const token = process.env.NODE_ENV === 'production' ? prodToken : devEnvToken;

const botTwitter = new TelegramBot(token, { polling: true });

export const sendMessage = async (message: any) => {
  try {
    botTwitter.sendMessage(-681460641, message, { parse_mode: 'HTML' });
  } catch (e) {
    console.log(e);
  }
};

//交易机器人
export const sendTradeMessage = async (message: any) => {
  try {
    botTwitter.sendMessage(-681460641, message, { parse_mode: 'HTML' });
  } catch (e) {
    console.log(e);
  }
};
