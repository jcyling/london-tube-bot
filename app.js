require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const bot = require("./bot");

// Start and configure express
const app = express();
app.use(morgan("tiny"));

app.get("/", (req, res) => {
  return res.status(200).send("Welcome to the London Tube Bot API. Find this bot on Telegram @LondonTubeBot.");
});

app.use(bot);

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening...");
});