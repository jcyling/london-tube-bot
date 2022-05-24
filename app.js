require("dotenv").config();
const fetch = require("node-fetch");
const { Telegraf } = require("telegraf");
const { Keyboard } = require("telegram-keyboard");
const bot = new Telegraf(process.env.BOT_TOKEN);

const baseUrl = "https://api.tfl.gov.uk/";

// Tube lines
const tubeLines = [
  "Bakerloo",
  "Central",
  "Circle",
  "District",
  "Hammersmith & City",
  "Jubilee",
  "Metropolitan",
  "Northern",
  "Piccadilly",
  "Victoria",
  "Waterloo",
  "Overground",
  "TfL Rail",
  "DLR"
];

// Api call
async function getCall(url) {
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

async function getLineStatus(line) {
  const response = await fetch(baseUrl + "line/mode/tube/status");
  const data = await response.json();
  const lineData = data.filter(item => item.name === line);
  const status = lineData[0].lineStatuses[0].statusSeverityDescription;
  return `${line}: ${status}`;
}

bot.command("start", (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, "Hello there! Welcome to the London Tube Bot", {});
});

bot.command("check", async (ctx) => {
  const url = baseUrl + "line/mode/tube/status";

  const data = await getCall(url);

  const lineNames = data.map(item => item.name);
  const lineStatus = data.map(item => item.lineStatuses[0].statusSeverityDescription);
  // const lineStatusNum = data.map(item => item.lineStatuses[0].statusSeverity);

  const status = [];
  lineNames.forEach((line, index) => {
    status.push(`${line}: ${lineStatus[index]}`);
  });

  const message = status.join("\r\n");

  ctx.reply(message);
});

bot.command("lines", async (ctx) => {
  const keyboard = Keyboard.make([
    ["Bakerloo", "Central", "Circle"],
    ["District", "Hammersmith & City", "Jubilee"],
    ["Metropolitan", "Northern", "Piccadilly"],
    ["Victoria", "Waterloo"],
    ["Overground", "TfL Rail", "DLR"]
  ]).reply();

  ctx.reply("Pick a line", keyboard);

});

bot.hears(tubeLines, async (ctx) => {
  ctx.reply("Hold on, checking...");
  const status = await getLineStatus(ctx.message.text);
  ctx.reply(status);
});

// Handle other texts sent to bot
bot.on("text", async (ctx) => {
  const message = `
  Welcome to the London Tube Bot!
  Get updates by sending these commands:
  /check - Check all lines
  /lines - Choose a line to check
  "Central" - Enter line name to check
  `;

  ctx.reply(message);
});

bot.launch();
