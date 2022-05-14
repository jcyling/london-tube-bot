require('dotenv').config();
const fetch = require("node-fetch");
const { Telegraf } = require('telegraf');
const { Keyboard } = require('telegram-keyboard');
const bot = new Telegraf(process.env.BOT_TOKEN);

const baseUrl = "https://api.tfl.gov.uk/";

// API call function
async function getCall(url) {
  const response = await fetch(url)
  const json = await response.json()
  return json
}

async function getLines() {
  const response = getCall(url + 'line/mode/tube')
  return response.map(item => item.name)
}


bot.command('start', (ctx) => {
  console.log(ctx.from)
  bot.telegram.sendMessage(ctx.chat.id, 'Hello there! Welcome to the London Tube Bot', {})
})

bot.command('check', async (ctx) => {
  const url = baseUrl + "line/mode/tube/status";

  const data = await getCall(url)
  console.log(data)

  const lineNames = data.map(item => item.name);
  const lineStatus = data.map(item => item.lineStatuses[0].statusSeverityDescription);
  const lineStatusNum = data.map(item => item.lineStatuses[0].statusSeverity);

  const status = [];
  lineNames.forEach((line, index) => {
    status.push(`${line}: ${lineStatus[index]}`);
  });

  const message = status.join('\r\n');

  ctx.reply(message)
});

bot.on('text', async (ctx) => {
  const lines = getLines()
  const keyboard = Keyboard.make([
    `Bakerloo`, `Central`
  ])

  await ctx.reply('Choose your line', keyboard.reply())
  await ctx.reply('Choose your line', keyboard.inline())

})

bot.launch();
