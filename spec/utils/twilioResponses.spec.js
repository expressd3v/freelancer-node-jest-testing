import {
  gatherCandidateAccessCode,
  hangup,
  initiateCall,
} from '../../utils/twilioResponses';

import ValidationError from '../../utils/errors';
import config from 'config';

describe('twilioResponses', () => {
  describe('gatherCandidateAccessCode', () => {
    it('should return correct response', () => {
      const expectedResponse =
        '<?xml version="1.0" encoding="UTF-8"?><Response><Gather timeout="30" numDigits="6"><Play loop="1"></Play></Gather><Play></Play></Response>';
      const response = gatherCandidateAccessCode("En");
      console.log('response +++++++++++', response);
      expect(response).toEqual(expectedResponse);
    });

    it('should accept options parameter', () => {
      const expectedResponse =
        '<?xml version="1.0" encoding="UTF-8"?><Response><Gather timeout="10" numDigits="6" input="speech"><Say voice="alice" language="en-US">Please insert candidate access code.</Say></Gather><Say voice="alice" language="en-US">Access code was not provided. Goodbye.</Say></Response>';
      const response = gatherCandidateAccessCode("En", {
        input: 'speech',
        timeout: 10,
      });

      expect(response).toEqual(expectedResponse);
    });
  });

  describe('callCandidate', () => {
    const { publicUrl } = config.get('app');
    const { callerId } = config.get('twilio');
    const candidate = {
      candidateId: '50',
      phoneNumber: '+48500500500',
    };

    xit('should return correct response', () => {
      const expectedResponse = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Redirecting a call. Please stand by.</Say><Dial callerId="${callerId}"><Number statusCallbackEvent="initiated ringing answered completed" statusCallback="${publicUrl}/webhook/status?candidate=50">+48500500500</Number></Dial></Response>`;
      const response = initiateCall({ contact: candidate, publicUrl });

      expect(response).toEqual(expectedResponse);
    });


    xit('should accept options parameter', () => {
      const expectedResponse = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Redirecting a call. Please stand by.</Say><Dial callerId="${callerId}"><Number statusCallbackEvent="initiated ringing answered completed" statusCallback="${publicUrl}/webhook/status?candidate=50" sendDigits="123">+48500500500</Number></Dial></Response>`;
      const response = initiateCall({
        contact: candidate,
        publicUrl,
        options: {
          sendDigits: 123,
        },
      });

      expect(response).toEqual(expectedResponse);
    });
  });

  describe('hangup', () => {
    it('should return correct response', () => {
      const expectedResponse =
        '<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>';
      const response = hangup({});

      expect(response).toEqual(expectedResponse);
    });

  });
});
