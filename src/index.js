"use strict";

const { plugins } = require("./plugins");
const { start } = require("./server");
const services = require("./services");

process.on("unhandledRejection", err => {
  services.loggerService.error(err);
  process.exit(1);
});

start(plugins, services);
