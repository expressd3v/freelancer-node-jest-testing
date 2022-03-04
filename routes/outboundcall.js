import {
  gatherCandidateAccessCode,
  hangup,
  initiateCall,
} from '../utils/twilioResponses';
import { get, omit } from 'lodash';
import { getCandidate, getSite } from '../utils/candidateQuires';

import CandidateCallActivity from '../models/CandidateCallActivity';
import CandidateContact from '../models/CandidateContact';
import bodyParser from 'body-parser';
import config from 'config';
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

  // All the routes here are used by Twilio so we are validate ech of it
  router.use(twilioValidate);

  // the primary callback route for twilio
  router.post('/', async (req, res) => {
    logger.info('checking: at Twilio Main Route');
    // the access code
    const { Digits, To, CalledCountry, ToCountry, FromCountry } = get(
      req,
      'body'
    );
    const { publicUrl } = config.get('app');
    const endPoint = `${publicUrl}/outboundcall`;

    /**
     * @accessCode - gather candidate access code before proceeding
     * after successful call, webhook will be recalled with Digits parameter
     * @Language To response with the proper language we pick translation voice based on
     * either `ToCountry` if provided (e.g `IT`) or `To` if its value is a phone number
     * and not a client identifier.
     * refer to https://www.twilio.com/docs/voice/twiml for request parameters
     */

    const calledCountry = getRequestOriginCountry({
      To,
      country: ToCountry || CalledCountry || FromCountry,
    });

    const shouldRequestCandidateAccessCode = !Digits;
    if (shouldRequestCandidateAccessCode) {
      const twiml = await gatherCandidateAccessCode(calledCountry);
      return res.twiml(twiml);
    }

    const accessCode = Digits;
    logger.debug(`Requested access code is: ${accessCode}`);

    let country;
    try {
      const contact = await CandidateContact.findByAccessCode(accessCode);

      if (!contact) {
        const twiml = await hangup({
          msgKey: 'noCandidate',
          country: calledCountry,
        });
        return res.twiml(twiml);
      }

      const {
        candidate: { siteId, studyId },
      } = await getCandidate(contact.candidateId).catch(() =>
        logger.error('error while fetching candidate')
      );

      const {
        site: {
          inboundProxyNumber: { value },
        },
      } = await getSite({ studyId, siteId });

      if (!value) {
        const twiml = await hangup({
          msgKey: 'noSitePhoneAssigned',
          country: calledCountry,
        });
        return res.twiml(twiml);
      }

      country = getCountryCode(value);
      contact.callerId = value;
      const twiml = await initiateCall({
        contact,
        publicUrl: endPoint,
        country: calledCountry || country,
      });
      return res.twiml(twiml);
    } catch (error) {
      switch (error.name) {
        case errorName.validationError:
          const twiml = await hangup({
            msgKey: 'noCandidatePhoneNum',
            country: calledCountry || country,
          });
          return res.twiml(twiml);
        default:
          logger.error(error);
          const twl = await hangup({
            msgKey: 'errorOccurred',
            country: calledCountry || country,
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
      publish('outboundcall.message', activity);
    } catch (error) {
      logger.error(error);
    }

    return res.send();
  });

  return router;
}
