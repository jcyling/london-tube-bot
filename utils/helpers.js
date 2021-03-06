const fetch = require("node-fetch");

const getCall = async (url) => {
  const response = await fetch(url);
  const json = await response.json();
  return json;
};

module.exports = {
  getCall
};