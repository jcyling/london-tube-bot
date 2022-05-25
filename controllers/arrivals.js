const { Scenes } = require("telegraf");
const Wizard = Scenes.WizardScene;

const getCall = async (url) => {
  const response = await fetch(url);
  const json = await response.json();
  return json;
};

const arrivals = new Wizard(
  "ARRIVALS_WIZARD",
  (ctx) => {
    ctx.reply("What is your station?");
    return ctx.wizard.next();
  },
  // Ask for station name
  async (ctx) => {
    const query = ctx.message.text;
    const res = await getCall(stoppointUrl + query);
    ctx.wizard.state.stationId = res.matches[0].id;
    const result = res.matches[0].name;

    ctx.reply(`Is it ${result}? Send Y or N to continue.`);
    return ctx.wizard.next();
  },
  // Validate station with user
  async (ctx) => {
    if (ctx.message.text === "Y" || ctx.message.text === "Yes") {
      ctx.reply("Got it! Looking it up... ⏳");

      const stationId = ctx.wizard.state.stationId;
      const arrivalsList = await getCall(arrivalsUrl + stationId + "/Arrivals");
      const timeOrderedList = arrivalsList.sort((a, b) => (a.timeToStation - b.timeToStation));

      const outboundTrain = timeOrderedList.find(item => item.direction === "outbound");
      const inboundTrain = timeOrderedList.find(item => item.direction === "inbound");

      const outboundTime = outboundTrain.expectedArrival.slice(11, -1);
      const inboundTime = inboundTrain.expectedArrival.slice(11, -1);

      ctx.reply(`
The next station outbound on ${outboundTrain.lineName} line will arrive in 
${outboundTime} on ${outboundTrain.platformName}.
      `);

      ctx.reply(`
The next station inbound on ${inboundTrain.lineName} line will arrive in 
${inboundTime} on ${inboundTrain.platformName}.
      `);

      ctx.scene.leave();
    }
    // Station not found
    else {
      ctx.reply("Gotta be more specific! What is your station?");
      ctx.wizard.back();
    }
  },
);

const stoppointUrl = "https://api.tfl.gov.uk/StopPoint/Search?modes=tube&query=";
const arrivalsUrl = "https://api.tfl.gov.uk/StopPoint/";

module.exports = arrivals;