import {
  gatherCandidateAccessCode,
  hangup,
  initiateCall,
} from '../utils/twilioResponses';
import { get, omit } from 'lodash';

import CandidateCallActivity from '../models/CandidateCallActivity';
import CandidateContact from '../models/CandidateContact';
import bodyParser from 'body-parser';
import errorName from '../enums/errorName';
import express from 'express';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { twilioValidate } from '../middlewares/validateTwilio';

const router = express.Router();

const getCountryCode = (phoneNumber) => {
  return get(parsePhoneNumberFromString(phoneNumber), 'country', '');
};

const getRequestOriginCountry = ({ To, country }) => {
  let calledCountry = '';
  if (country) calledCountry = country;
  else if (To.startsWith('+')) calledCountry = getCountryCode(To);
  return calledCountry;
};

export function handler(app) {
  app.use(bodyParser.urlencoded({ extended: false }));
  const { logger } = app;

  logger.info('checking: at Twilio handler route');

  router.use(twilioValidate);

  // the primary callback route for twilio
  router.route('/').post(async (req, res) => {
    logger.info('checking: at Twilio Main Route');

    const { Digits, To, CalledCountry, ToCountry, FromCountry } = get(
      req,
      'body'
    );

    const calledCountry = getRequestOriginCountry({
      To,
      country: ToCountry || CalledCountry || FromCountry,
    });

    // the access code
    const shouldRequestCandidateAccessCode = !Digits;
    // gather candidate access code before proceeding
    // after successful call, webhook will be recalled with Digits parameter
    if (shouldRequestCandidateAccessCode) {
      const twiml = await gatherCandidateAccessCode(calledCountry);
      return res.twiml(twiml);
    }

    const accessCode = Digits;
    logger.debug(`Requested access code is: ${accessCode}`);

    try {
      const contact = await CandidateContact.findByAccessCode(accessCode);

      if (!contact) {
        const twiml = await hangup({
          msgKey: 'noCandidate',
          country: calledCountry,
        });
        return res.twiml(twiml);
      }

      const twiml = await await initiateCall({
        contact,
        country: calledCountry,
      });
      return res.twiml(twiml);
    } catch (error) {
      switch (error.name) {
        case errorName.validationError:
          const twiml = await hangup({
            msgKey: 'noCandidatePhoneNum',
            country: calledCountry,
          });
          return res.twiml(twiml);
        default:
          logger.error(error);
          const twl = await hangup({
            msgKey: 'errorOccurred',
            country: calledCountry,
          });
          return res.twiml(twl);
      }
    }
  });

  // used for transmitting current status of the call
  // https://support.twilio.com/hc/en-us/articles/223132547-What-are-the-Possible-Call-Statuses-and-What-do-They-Mean-
  router.route('/status').post(async (req, res) => {
    // is the candidateId
    // FIXME rename to candidateId

    logger.info('checking: at Twilio Status Route');

    const { candidate } = req.query;

    // only send activity if we have id
    if (!candidate) {
      return res.end();
    }

    const { CallStatus, CallDuration, Timestamp } = req.body;
    const activity = new CandidateCallActivity({
      createdAt: new Date(Timestamp).toISOString(),
      candidateId: candidate,
    });

    logger.debug(`Current CallStatus: ${CallStatus}`);

    if (CallStatus) {
      activity.action = CallStatus;
      activity.duration = CallDuration;
      activity.additionalPayload = omit(req.body, ['To', 'Called']);
    }

    try {
      // rabbitmq-gateway-worker will handle the message
      publish('twilio.message', activity);
    } catch (error) {
      logger.error(error);
    }

    return res.send();
  });

  router.route('/outboundcall/status').post(async (req, res) => {
    const { candidate } = req.query;

    if (!candidate) {
      return res.end();
    }

    const { CallStatus, CallDuration, Timestamp } = req.body;

    const activity = new CandidateCallActivity({
      createdAt: new Date(Timestamp).toISOString(),
      candidateId: candidate,
    });

    if (CallStatus) {
      activity.action = CallStatus;
      activity.duration = CallDuration;
      activity.additionalPayload = omit(req.body, ['To', 'Called']);
    }

    try {
      // rabbitmq-gateway-worker will handle the message
      publish('outboundcall.message', activity);
    } catch (error) {
      logger.error(error);
    }

    return res.send();
  });

  return router;
}
