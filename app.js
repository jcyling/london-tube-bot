require("dotenv").config();
const express = require("express");
const bot = require("./bot");

// Start and configure express
const app = express();
app.use(express.json());


app.get("/", (req, res) => {
  return res.status(200).send("Welcome to the London Tube Bot API. Find this bot on Telegram @LondonTubeBot.");
});

app.post(`/${process.env.BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.status(200).json({ message: "ok" });

});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening...");
});