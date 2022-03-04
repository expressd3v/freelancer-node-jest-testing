import config from 'config';
import log from '../config/logger';
import twilio from 'twilio';

const { authToken, validation } = config.get('twilio');

export function twilioValidate(req, res, next) {
  log.debug('Twilio validation checking');

  // Checking if the validation is set from ENV === false
  // if it is false:
  // - log a warn
  // - return to skip validation
  if (validation === 'false') {
    log.warning('Twilio validation is not active!');
    return next();
  }

  // If validation is active
  log.debug('Validation is active!');

  // Extra checking to be sure we validate as default true
  const shouldValidate = validation ? validation : true;
  try {
    // Return Twilio validation
  return twilio.webhook({ validate: shouldValidate }, authToken)(
    req,
    res,
    next
  );
  } catch (error) {
    log.error('Cannot validate', error);
  }
}
