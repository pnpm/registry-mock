function noop (..._args: any[]) {}

export const quietLog = {
  error: console.error,
  warn: console.warn,
  info: noop,
  verbose: noop,
  silly: noop,
  http: noop,
  pause: noop,
  resume: noop,
}
