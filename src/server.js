const Hapi = require("hapi");

async function Server(plugins = []) {
  const server = Hapi.server({
    host: "0.0.0.0",
    port: 3000
  });

  await server.register(plugins);
  return server;
}

async function start(plugins = [], { loggerService } = {}) {
  try {
    const server = await Server(plugins);
    await server.start();
    loggerService.info("Server running at:", server.info.uri);
  } catch (err) {
    loggerService.error(err);
    process.exit(1);
  }
}

module.exports = {
  Server,
  start
};
