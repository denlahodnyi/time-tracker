import chalk from 'chalk';
import morgan from 'morgan';

morgan.token('status', function (req, res) {
  const code = res.statusCode || 0;

  if (code >= 500) return chalk.red(code);
  if (code >= 400) return chalk.redBright(code);
  if (code >= 300) return chalk.yellow(code);
  if (code >= 200) return chalk.green(code);
});

morgan.token('method', function (req) {
  return chalk.magenta(req.method);
});

morgan.token('url', function (req) {
  return chalk.cyan(req.url);
});

const logger = () => {
  return morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
    ].join(' ');
  });
};

export default logger;
