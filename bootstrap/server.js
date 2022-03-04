import config from 'config';

export default async (app) => {
    const { port } = config.get('app');

    await app.listen(port);

    app.logger.info(`Server is listening on ${port}`);

    // TODO: pass proxy address to right side
    // Ensure that Twilio can validate requests behind proxy
    // https://www.twilio.com/docs/usage/security#validating-requests
    app.set('trust proxy', true);

    return app;
};
