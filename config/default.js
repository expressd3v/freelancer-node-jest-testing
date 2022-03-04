/*
 Default app's configuration file
*/
module.exports = {
  app: {
    port: 5000,
    publicUrl: '',
  },
  // Enabled bootstrap functions
  bootstrap: ['middlewares', 'routes', 'server'],
  // Enabled middlewares
  middleware: ['bodyParserUrlEncoded', 'resTwiml'],
  // Enabled routes
  routes: ['twilio', 'amazon', 'sms', 'outboundcall', 'inboundcall'],
  candidateService: {
    endpoint: '',
  },
  studyService: {
    studyServiceEndpoint: '',
  },
  twilio: {
    authToken: '',
    callerId: '',
    devNumber: '',
  },
  bodyParser: {
    urlencoded: {
      extended: true,
    },
  },
  recordings: {
    recordingsBaseUrl: '',
    recordings: '',
  },
};
