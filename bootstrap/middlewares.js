import middlewares from '../middlewares';

export default async (app) => {
    app.logger.info('Bootstrapping middlewares');

    return middlewares(app);
};
