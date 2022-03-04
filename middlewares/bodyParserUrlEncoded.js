import config from 'config';
import bodyParser from 'body-parser';

export default (app) => {
    const urlEncodedConfig = config.get('bodyParser.urlencoded');

    app.use('/', bodyParser.urlencoded(urlEncodedConfig));
};
