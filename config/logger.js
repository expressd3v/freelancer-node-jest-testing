import { addColors, config, createLogger, format, transports } from 'winston';

const { printf, combine, timestamp, colorize } = format;

const logLevel = process.env.LOG_LEVEL;

const logLevels  = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    debug: 4,
    trace: 5
  },
  colors: {
    fatal:    'red',
    error:    'orange',
    warning:  'yellow',
    info:     'green',
    debug:    'blue',
    trace:    'gray'
  }
};

addColors(logLevels);

// don't show console logs in test mode
const transport =
  process.env.NODE_ENV !== 'test' ? [new transports.Console()] : [];
createLogger
export default createLogger({
  levels: config.syslog.levels,
  level: logLevel || 'info',
  format: combine(
    timestamp(),
    printf((info) => `[${info.timestamp}][${info.level}]: ${info.message}`),
    colorize({ all: true })
  ),
  transports: [
    ...transport,
  ],
});
