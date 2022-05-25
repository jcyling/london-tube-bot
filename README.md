==This bot is a work in progress (Dated: 25/05/2022)==

# London Tube Bot
A telegram bot that lets you check the status of the London Underground.

## How do you use it?
Open Telegram and find @LondonTubeBot.

Use the following commands:
- /check - Checks all lines
- /lines - Pick a line using the provided keyboard
- "Bakerloo" - Enter a valid line name to check its status
- /arrivals - Check the next inbound and outbound train at a station

## How does it work?
The app is ran on a node.js server and connects your queries to the [TfL API](https://api.tfl.gov.uk/).