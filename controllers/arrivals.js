const { Scenes } = require("telegraf");
const Wizard = Scenes.WizardScene;
const { getCall } = require("../utils/helpers");
const { YNKeyboard } = require("../utils/keyboards");

const arrivals = new Wizard(
  "ARRIVALS_WIZARD",
  (ctx) => {
    ctx.reply("What is your station?");
    return ctx.wizard.next();
  },
  // Ask for station name
  async (ctx) => {
    const query = ctx.message.text;
    try {
      const res = await getCall(stoppointUrl + query);

      ctx.wizard.state.stationId = res.matches[0].id;
      const result = res.matches[0].name;

      // Use inline keyboard for station validation
      ctx.reply(`Is it ${result}?`, YNKeyboard.reply());

      return ctx.wizard.next();
    }
    catch (error) {
      console.log(error);
      return ctx.scene.leave();
    }
  },
  // Validate station with user
  async (ctx) => {
    if (ctx.message.text.toLowerCase() === "y" || ctx.message.text.toLowerCase() === "yes") {
      ctx.reply("Got it! Looking it up... ⏳");

      const stationId = ctx.wizard.state.stationId;

      try {
        const arrivalsList = await getCall(arrivalsUrl + stationId + "/Arrivals");

        // Validate response 
        if (arrivalsList.length === 0) {
          ctx.reply("Something went wrong! Try again later.");
          return ctx.scene.leave();
        }

        const timeOrderedList = arrivalsList.sort((a, b) => (a.timeToStation - b.timeToStation));

        const outboundTrain = timeOrderedList.find(item => item.direction === "outbound");
        console.log(outboundTrain);
        const inboundTrain = timeOrderedList.find(item => item.direction === "inbound");
        console.log(inboundTrain);

        const outboundTime = outboundTrain.expectedArrival.slice(11, -1);
        const inboundTime = inboundTrain.expectedArrival.slice(11, -1);

        ctx.reply(`
🚆 The next outbound train on ${outboundTrain.lineName} line will arrive at 
${outboundTime} on ${outboundTrain.platformName}.
      `);

        ctx.reply(`
🚆 The next inbound train on ${inboundTrain.lineName} line will arrive at 
${inboundTime} on ${inboundTrain.platformName}.
      `);

        return ctx.scene.leave();
      }
      catch (error) {
        console.log(error);
        return ctx.scene.leave();
      }
    }
    // If the station was not found
    else {
      ctx.reply("Gotta be more specific! What is your station?");
      ctx.wizard.back();
    }
  },
);

const stoppointUrl = "https://api.tfl.gov.uk/StopPoint/Search?modes=tube&query=";
const arrivalsUrl = "https://api.tfl.gov.uk/StopPoint/";

module.exports = arrivals;