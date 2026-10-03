/**
 * Structured logger with level-based output.
 * Designed to be swapped for winston/pino in production.
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
};

const timestamp = () => new Date().toISOString();

const logger = {
  error(message, ...args) {
    console.error(`${colors.red}[ERROR]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} ${message}`, ...args);
  },

  warn(message, ...args) {
    console.warn(`${colors.yellow}[WARN]${colors.reset}  ${colors.gray}${timestamp()}${colors.reset} ${message}`, ...args);
  },

  info(message, ...args) {
    console.log(`${colors.blue}[INFO]${colors.reset}  ${colors.gray}${timestamp()}${colors.reset} ${message}`, ...args);
  },

  debug(message, ...args) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${colors.cyan}[DEBUG]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} ${message}`, ...args);
    }
  },
};

export default logger;
