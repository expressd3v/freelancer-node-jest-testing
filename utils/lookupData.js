import config from 'config';
import fetch from 'node-fetch';
import log from '../config/logger';

const { recordingsBaseUrl, recordings } = config.get('recordings');

// Getting the recordings.json file
export async function lookupData() {
  try {
    log.info('Getting the lookup data');
    return await fetch(new URL(recordings, recordingsBaseUrl)).then((res) =>
      res.json()
    );
  } catch (error) {
    // If above fails we log the error as 
    // e.g. Error fetching the data: 'invalid url'
    log.error('Error fetching the data: ', error);
  }
}
