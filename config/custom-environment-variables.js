const config = {
  app: {
    port: 'NODE_PORT',
    publicUrl: 'TWILIO_PUBLIC_URL',
  },
  candidateService: {
    endpoint: 'CANDIDATE_SERVICE_URL',
  },
  studyService: {
    studyServiceEndpoint: 'STUDY_SERVICE_URL',
  },
  twilio: {
    authToken: 'TWILIO_AUTH_TOKEN',
    callerId: 'TWILIO_CALLER_ID',
    devNumber: 'TWILIO_DEV_NUMBER',
    // validation if not provided is defaulted to true
    validation: 'TWILIO_DISABLE_REQUEST_VALIDATION',
  },
  recordings: {
    // The base URL where the recordings are e.g. https://example.com/<example>/
    recordingsBaseUrl: 'RECORDINGS_BASE_URL',
    // The file which should be present in the remote resourced folder
    // as e.g. recordings.json
    // this file works as a table of true for the records in the remote folder
    // the audio recording file need to be present on the remote folder and also on the file
    recordings: 'RECORDINGS',
  },
};

module.exports = config;
