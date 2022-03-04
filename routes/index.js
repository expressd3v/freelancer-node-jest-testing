import requireDir from 'require-directory';
import config from 'config';

const routesToLoad = config.get('routes');
const routes = requireDir(module);

export default function (app) {
  // run through all routes and attach them to the app
  routesToLoad.forEach((endpoint) => {
    const route = routes[endpoint];
    if (!route) {
      throw new Error(`'/${endpoint}' route handler not found`);
    }

    app.logger.info(`Route '/${endpoint}' added`);

    const handler = route.handler;

    app.use(`/${endpoint}`, handler(app));
  });

  return app;
}
