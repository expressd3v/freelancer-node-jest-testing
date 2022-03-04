/*
 Application's bootstrap
*/
import express from 'express';
import config from 'config';
import requireDir from 'require-directory';

import logger from './../config/logger';

if (process.env.NODE_ENV === 'development' && !config.get('twilio').devNumber) {
  logger.warn('No dev number available. Who would you call in development?');
}

// get enabled bootstrap functions
const functionsToRun = config.get('bootstrap') || [];
// each module exports a function which takes App as a param and returns enchanced App in a promise
// get all available bootstrap modules
const modules = requireDir(module);

// initialize express application
const app = express();

// attach logger to application instance
app.logger = logger;

app.logger.info('Staring the app');
app.logger.info(`Bootstrapping ${functionsToRun.length} module(s)`);

// iterate instance through all enabled bootstrap functions
// returns bootstrapped app instance promise
export default () => functionsToRun.reduce(async (previousPromise, functionName) => {
    const { default: bootstrapFunc } = modules[functionName] || {};

    if(typeof bootstrapFunc === 'undefined') {
        throw new Error(`${functionName} bootstrap not found!`);
    }

    const app = await previousPromise;

    return bootstrapFunc(app);
}, Promise.resolve(app));
