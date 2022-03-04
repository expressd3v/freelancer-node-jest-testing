import { get, toUpper } from 'lodash';

export const EN = {
  accessCode: 'Please insert candidate access code.',
  noAccessCode: 'Access code was not provided. Goodbye.',
  redirecting: 'Redirecting a call. Please stand by',
  thanksForCalling:
    'Thank you for calling . we will contact you shortly. Good bye',
  notRegisteredPhone:
    'Can not recognize this phone number, Please use a registered phone number. Good bye',
  noSitePhoneAssigned:
    'An error has occurred, no phone number assigned to the site. Goodbye.',
  noCandidatePhoneNum:
    'Candidate phone number is missing. Goodbye.',
  noCandidate:
    'Candidate has not been found. Goodbye.',
  errorOccurred:
    'An error has occurred. Goodbye.',
};

export const IT = {
  accessCode: 'Inserisci il codice di accesso candidato.',
  noAccessCode: 'Il codice di accesso non è stato fornito. Addio.',
  redirecting: 'Reindirizzamento di una chiamata. Per favore aspetta',
  thanksForCalling: 'Grazie per la chiamata . Ti contatteremo a breve. Addio',
  notRegisteredPhone:
    'Impossibile riconoscere questo numero di telefono, utilizzare un numero di telefono registrato. Addio',
  noSitePhoneAssigned:
    'Si è verificato un errore, nessun numero di telefono assegnato al sito. Addio.',
  noCandidatePhoneNum:
    'Manca il numero di telefono del candidato. Addio.',
  noCandidate:
    'Il candidato non è stato trovato. Addio.',
  errorOccurred:
    'Cè stato un errore. Addio.',
};


export const getMessageTranslation = ({ country, msgKey }) => {
  switch (toUpper(country)) {
    case 'IT':
      return get(IT, msgKey);
    default:
      return get(EN, msgKey);
  }
};
