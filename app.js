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
];

async function getCall(url) {
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

async function getLineStatus(line) {
  if (line.match("&")) {
    line = line.replace(/ & /, "-");
  }
  const response = await fetch(baseUrl + `line/${line}/status`);
  const data = await response.json();
  const status = data[0].lineStatuses[0].statusSeverityDescription;

  // Line has good service
  if (status === "Good Service") {
    return `${line}: ${status}`;
  }
  // Line has disruptions, return details
  else {
    const disruption = data[0].lineStatuses[0].disruption;
    const desc = disruption.description;
    return `${desc}`;
  }
}


bot.command("start", (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, "Hello there! Welcome to the London Tube Bot", {});
});

bot.command("all", async (ctx) => {
  ctx.reply("Hold on, checking...");
  const url = baseUrl + "line/mode/tube/status";

  const data = await getCall(url);

  const lineNames = data.map(item => item.name);
  const lineStatus = data.map(item => item.lineStatuses[0].statusSeverityDescription);

  const status = [];
  lineNames.forEach((line, index) => {
    let marker = "";
    if (lineStatus[index] === "Good Service") {
      marker = "🟢";
    }
    else {
      marker = "🔴";
    }
    status.push(`${line}: ${lineStatus[index]} ${marker}`);
  });

  const message = status.join("\r\n");

  ctx.reply(message);
});

bot.command("lines", async (ctx) => {
  const keyboard = Keyboard.make([
    ["Bakerloo", "Central", "Circle"],
    ["District", "Waterloo", "Jubilee"],
    ["Metropolitan", "Northern", "Piccadilly"],
    ["Victoria", "Hammersmith & City"]
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
  Welcome to the London Tube Bot! 🚇
  Get updates by sending these commands:
  /all - Check all lines
  /lines - Choose a line to check
  "Central" - Send a line name to check
  `;

  ctx.reply(message);
});

bot.catch((err, ctx) => {
  console.log(`Oops, something went wrong for ${ctx.updateType}`, err);
});

bot.launch();
