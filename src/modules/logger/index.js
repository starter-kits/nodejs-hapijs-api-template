"use strict";

function log() {
  const [logLevel, message, ...meta] = arguments;

  const metaDataAsString = meta.length ? JSON.stringify(meta) : '';
  console.log(`[${logLevel}] `, message, metaDataAsString); //eslint-disable-line no-console
}

const emerg = (...args) => log("emerg", ...args);
const alert = (...args) => log("alert", ...args);
const crit = (...args) => log("crit", ...args);
const error = (...args) => log("error", ...args);
const warning = (...args) => log("warning", ...args);
const notice = (...args) => log("notice", ...args);
const info = (...args) => log("info", ...args);
const debug = (...args) => log("debug", ...args);

module.exports = {
  emerg,
  alert,
  crit,
  error,
  warning,
  notice,
  info,
  debug
};
