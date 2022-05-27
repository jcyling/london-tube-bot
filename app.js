require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const { Telegraf, Scenes, session } = require("telegraf");

const arrivals = require("./controllers/arrivals");
const { getCall } = require("./utils/helpers");
const { linesKeyboard } = require("./utils/keyboards");
const bot = new Telegraf(process.env.BOT_TOKEN);

const baseUrl = "https://api.tfl.gov.uk/";

// Start and configure express
const app = express();
app.use(express.json());

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
  "Waterloo & City",
];

app.get("/", (req, res) => {
  return res.status(200).send("Hi, please find this bot on Telegram @LondonTubeBot!");
});

app.post("/", (req, res, next) => {

  const getLineStatus = async (line) => {
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
  };

  bot.command("start", (ctx) => {
    bot.telegram.sendMessage(ctx.chat.id, "Hello there! Welcome to the London Tube Bot", {});
    res.send(200);
  });

  bot.command("all", async (ctx) => {
    ctx.reply("Hold on, checking...");
    const url = baseUrl + "line/mode/tube/status";

    try {
      const data = await getCall(url);

      const lineNames = data.map(item => item.name);
      const lineStatus = data.map(item => item.lineStatuses[0].statusSeverityDescription);

      const status = [];
      lineNames.forEach((line, index) => {
        let marker = "";
        if (lineStatus[index] === "Good Service") {
          marker = "✅";
        }
        else if (lineStatus[index] === "Service Closed") {
          marker = "⚫";
        }
        else {
          marker = "⭕";
        }
        status.push(`${marker} ${line}: ${lineStatus[index]}`);
      });

      const message = status.join("\r\n");

      ctx.reply(message);
    }
    catch (error) {
      next(error);
    }

  });

  bot.command("lines", async (ctx) => {
    ctx.reply("Pick a line:", linesKeyboard.reply());
  });

  bot.hears(tubeLines, async (ctx) => {
    ctx.reply("Hold on, checking...");
    try {
      const status = await getLineStatus(ctx.message.text);
      ctx.reply(status);
    }
    catch (error) {
      next(error);
    }
  });

  const stage = new Scenes.Stage([arrivals]);
  bot.use(session());
  bot.use(stage.middleware());

  bot.command("arrivals", Scenes.Stage.enter("ARRIVALS_WIZARD"));

  // All other routes, return usage message
  bot.on("text", async (ctx) => {
    const message = `
🚇 Welcome to the London Tube Bot! 
Get updates by sending these commands:
/all - Check all lines
/lines - Choose a line to check
/arrivals - Check the next inbound/outbound train at your station
"Central" - Send a line name to check
  `;

    ctx.reply(message);
  });

  bot.catch((err, ctx) => {
    console.log(`Oops, something went wrong with ${err}`);
    ctx.reply("Sorry about that. Something went wrong. There's a bug to catch!");
  });

  bot.launch();

});

app.use((err, req, res, next) => {
  console.log(err);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening...");
});