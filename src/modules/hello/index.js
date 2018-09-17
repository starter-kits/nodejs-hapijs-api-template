"use strict";

const hello = {
  name: "hello",
  version: "*",
  register: async function(server, options) {
    const {
      services: { loggerService }
    } = options;
    server.route({
      method: "GET",
      path: "/hello",
      handler
    });
    loggerService.info("hello plugin is registered");
    await Promise.resolve(); // just a placeholder if necessary
  }
};

async function handler(request, h /* eslint-disable-line no-unused-vars */) {
  return "hello world";
}

module.exports = {
  hapiPlugin: hello
};
