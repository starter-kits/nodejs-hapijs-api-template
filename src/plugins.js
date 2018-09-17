"use strict";

const { hapiPlugin: hello } = require("./modules/hello");
const services = require("./services");

const plugins = [
  {
    plugin: hello,
    options: { services }
  }
];

module.exports = {
  plugins
};
