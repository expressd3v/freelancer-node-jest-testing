import { get, omit } from 'lodash';
import { hangup, initiateCall } from '../utils/twilioResponses';

import CandidateCallActivity from '../models/CandidateCallActivity';
import bodyParser from 'body-parser';
import { checkIfCandidate } from '../utils/candidateQuires';
import config from 'config';
import express from 'express';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { twilioValidate } from '../middlewares/validateTwilio';

const router = express.Router();

const getCountryCode = (phoneNumber) => {
  return get(parsePhoneNumberFromString(phoneNumber), 'country', '');
};
export function handler(app) {
  app.use(bodyParser.urlencoded({ extended: false }));
  const { logger } = app;
  logger.info('checking: at Twilio handler route');

  router.use(twilioValidate);

  // the primary callback route for twilio
  router.route('/').post(async (req, res) => {
    logger.info('checking: at Twilio Main Route');
    // fetch candidate by there phone numbers
    const { From, To } = req.body;
    const { candidates } = await checkIfCandidate(From);
    const { publicUrl } = config.get('app');
    const country = getCountryCode(To || From);

    if (candidates.length) {
      const candidatesIds = candidates.map((candidate) => candidate.id);
      const studyId = get(candidates, '0.studyId');
      const candidateStatus = get(candidates, '0.status.type');
      const callerId = To;
      const { TRANSPERFECT_PHONENUMBER, JANSSEN_STUDYID } = process.env;
      /** only if The candidate belongs to study MDD1 */
      if (
        studyId === JANSSEN_STUDYID &&
        candidateStatus === 'PENDING_CALLCENTER'
      ) {
        const endPoint = `${publicUrl}/inboundcall`;
        const candidateId = candidatesIds[0];
        // Use Transperfect phone number
        const phoneNumber = TRANSPERFECT_PHONENUMBER;
        const contact = { candidateId, phoneNumber, callerId };

        const twiml = await initiateCall({
          contact,
          publicUrl: endPoint,
          country,
        });
        return res.twiml(twiml);
      }

      // publish to rabbitmq-gateway-worker where it will be handled there.
      publish('inboundcall.message', { candidatesIds });
      const twiml = await hangup({
        msgKey: 'thanksForCalling',
        country,
      });
      return res.twiml(twiml);
    }

    // message if the candidate contact us from un-recognized phone number.
    const twiml = await hangup({
      msgKey: 'notRegisteredPhone',
      country,
    });
    return res.twiml(twiml);
  });

  router.route('/status').post(async (req, res) => {
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
      publish('inboundcall.message', { activity });
    } catch (error) {
      logger.error(error);
    }

    return res.send();
  });

  return router;
}
