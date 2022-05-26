const { Keyboard } = require("telegram-keyboard");

const YNKeyboard = Keyboard.make([
  ["Yes", "No"]
]);

const linesKeyboard = Keyboard.make([
  ["Bakerloo", "Central", "Circle"],
  ["District", "Waterloo & City", "Jubilee"],
  ["Metropolitan", "Northern", "Piccadilly"],
  ["Victoria", "Hammersmith & City"]
]);

module.exports = {
  YNKeyboard,
  linesKeyboard
};