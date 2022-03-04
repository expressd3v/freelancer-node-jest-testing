import requireDir from 'require-directory';
import config from 'config';

const middlewaresToLoad = config.get('middleware');
const modules = requireDir(module);

export default (app) => {
    // run through all middlwares and attach them to the app
    middlewaresToLoad.forEach((name) => {
        const module = modules[name];

        if(typeof module === 'undefined') {
            throw new Error(`${name} middleware not found`);
        }

        app.logger.info(`Middleware ${name} added`);

        const middleware = module.default;

        middleware(app);
    });

    return app;
};
