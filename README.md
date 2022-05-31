*This bot is a work in progress (Dated: 25/05/2022).*

<img src=/assets/images/london-tube-bot-all.gif width=400 height=865 />
<img src=/assets/images/london-tube-bot-lines.gif width=400 height=865 />
<img src=/assets/images/london-tube-bot-arrivals.gif width=400 height=865 />

# London Tube Bot
A telegram bot that lets you check the status of the London Underground.

## How do you use it?
Open Telegram and find `@LondonTubeBot`.

Use the following commands:
- `/check` - Checks all lines
- `/lines` - Pick a line using the provided keyboard
- `/arrivals` - Check the next inbound and outbound train at a station
- `Bakerloo` - Enter a valid line name to check its status

## Libraries
- Express - for setting up a webhook with Telegram
- Telegraf - a Telegram bot framework
- Telegram-keyboard - a Telegram inline-keyboard builder
- Morgan - for logging

## How does it work?
The app is ran on a node.js server and connects your queries to the [TfL API](https://api.tfl.gov.uk/).


## How do you host the bot?
Get a bot token from the Telegram app. 
Set it to the environment variable BOT_TOKEN.
In your local environment: run with `npm run dev`.
In a designated server: run with `npm start`.