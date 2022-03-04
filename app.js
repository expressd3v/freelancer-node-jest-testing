/*
 Application's entry file
 Bootstraping and starting the app happens here
*/
// import 'reflect-metadata';
import bootstrap from './bootstrap';
import logger from './config/logger';
// start the application
const app = bootstrap();

// expose a running app instance as a Promise
export default (async () => {
    try {
        const instance = await app;

        logger.info('===========');
        await setupConnection()

        return instance;
    } catch(error) {
        // bootstrap failed
        logger.error(error);
    }
})();
