import routes from '../routes';

export default async (app) => {
    app.logger.info('Bootstrapping routes');

    return routes(app);
};
