require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const bot = require("./bot");

// Start and configure express
const app = express();
app.use(morgan("tiny"));

// Start bot
if (process.env.NODE_ENV === "development") {
  // bot.launch();
  bot.telegram.setWebhook(`${process.env.LT_URL}${process.env.BOT_TOKEN}`);
}
else if (process.env.NODE_ENV === "production") {
  bot.telegram.setWebhook(`${process.env.HEROKU_URL}${process.env.BOT_TOKEN}`);
}

app.use(bot.webhookCallback(`/${process.env.BOT_TOKEN}`));

app.get("/", (req, res) => {
  return res.status(200).send("Welcome to the London Tube Bot API. Find this bot on Telegram @LondonTubeBot.");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening...");
});