const { Scenes } = require("telegraf");
const Wizard = Scenes.WizardScene;
const { getCall } = require("../utils/helpers");
const { YNKeyboard } = require("../utils/keyboards");

const baseUrl = "https://api.tfl.gov.uk/";

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
      const res = await getCall(baseUrl + "StopPoint/Search?modes=tube&query=" + query);
      
      if (res.total === 0) {
        ctx.reply("Gotta be more specific! What is your station?");
        return ctx.wizard.selectStep(1);
      }

      ctx.wizard.state.stationId = res.matches[0].id;
      let result = res.matches[0].name;

      // If api response id is a HUB, use TfL API to find tube station ID
      if (ctx.wizard.state.stationId.match(/HUB/)) {
        const res = await getCall(baseUrl + "StopPoint/" + ctx.wizard.state.stationId);
        const tubeInfo = res.children.find(item => item.stopType === "NaptanMetroStation");
        ctx.wizard.state.stationId = tubeInfo.id;
      }

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
    // If the station was found
    if (ctx.message.text.toLowerCase() === "y" || ctx.message.text.toLowerCase() === "yes") {
      ctx.reply("Got it! Looking it up... ⏳");

      const stationId = ctx.wizard.state.stationId;
      
      try {
        const arrivalsList = await getCall(baseUrl + "StopPoint/" + stationId + "/Arrivals");

        // Validate response 
        if (arrivalsList.length === 0) {
          ctx.reply("Something went wrong! Try again later.");
          return ctx.scene.leave();
        }

        const timeOrderedList = arrivalsList.sort((a, b) => (a.timeToStation - b.timeToStation));

        const outboundTrain = timeOrderedList.find(item => item.direction === "outbound");
        const inboundTrain = timeOrderedList.find(item => item.direction === "inbound");

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

module.exports = arrivals;