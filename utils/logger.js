function format(level, message) {
  return `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}`;
}

const logger = {
  info(message) {
    console.log(format("info", message));
  },
  warn(message) {
    console.warn(format("warn", message));
  },
  error(message) {
    console.error(format("error", message));
  }
};

module.exports = { logger };
