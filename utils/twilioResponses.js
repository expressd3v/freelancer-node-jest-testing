import { ValidationError } from './errors';
import config from 'config';
import log from '../config/logger';
import { lookupData } from './lookupData';
import twilio from 'twilio';

const { VoiceResponse } = twilio.twiml;

const { recordingsBaseUrl } = config.get('recordings');

// !NOTE
// ?COUNTRY: webhook of Twilio give us a country as "US"
const getAudioByCountry = async (country) => {
  // Checking if the lookup has the country
  // Return the data for that country
  log.info('Checking if the lookup has the country');
  const lookup = await lookupData();

  if ([lookup].includes(country.toLowerCase())) {
    return obj[country.toLowerCase()];
  }

  log.info('No country matching the lookup - default to US');
  
  // Default to US if we have no match country/lookup
  return lookup.us;
};

export async function gatherCandidateAccessCode(country, options = {}) {
  log.info('Gather candidate access code');

  const response = new VoiceResponse();
  const gather = response.gather({
    ...{ timeout: 30, numDigits: 6 },
    ...options,
  });

  // !INFO:
  // LINK: https://www.twilio.com/docs/voice/twiml/play
  // <Play> Can be nested with Gather
  // But accepts only Loop & URL string parameter of the Audio file
  // Loop by default is 1 and suggested is 10
  // e.g. 'https://amazon-s3/audio.mp3' this will be from consumed lookup JSON on S3
  //
  // gather.play(
  //   {
  //     loop: 10
  //   },
  //   URL
  // );

  const audioCountry = await getAudioByCountry(country);
  const accessCode = await audioCountry.accessCode;
  const noAccessCode = await audioCountry.noAccessCode;

  const accessCodeUrl = new URL(accessCode, recordingsBaseUrl);
  const noAccessCodeUrl = new URL(noAccessCode, recordingsBaseUrl);

  // Play the audio file
  gather.play(
    {
      loop: 1,
    },
    accessCodeUrl
  );

  // in case gather failed
  response.play(
    {
      loop: 1,
    },
    noAccessCodeUrl
  );

  return response.toString();
}

// build [twiML](https://www.twilio.com/docs/glossary/what-is-twilio-markup-language-twiml) markup
export async function initiateCall({
  contact = {},
  publicUrl,
  country,
  options = {},
}) {
  log.info('Initiating the call');
  const { candidateId, phoneNumber, callerId } = contact;
  if (!phoneNumber) {
    throw new ValidationError({
      phoneNumber: 'Number is required',
    });
  }
  
  const twiml = new VoiceResponse();
  log.debug(`callerId number: ${callerId}`);
  log.debug(`to number: ${phoneNumber}`);
  log.debug(`public url: ${publicUrl}`);

  const audioCountry = await getAudioByCountry(country);
  const redirect = await audioCountry.redirecting;
  const redirectUrl = new URL(redirect, recordingsBaseUrl);

  // Redirecting
  twiml.play(
    {
      loop: 1,
    },
    redirectUrl
  );

  // redirect call from Outbound phone number to Inbound one in the candidate country.
  // https://www.twilio.com/docs/voice/twiml/dial
  const dial = twiml.dial({
    // required valid Twilio number
    callerId,
  });

  dial.number(
    {
      statusCallbackEvent: 'initiated ringing answered completed',
      statusCallback: `${publicUrl}/status?candidate=${candidateId}`,
      ...options,
    },
    phoneNumber
  );

  return twiml.toString();
}

export async function hangup({ msgKey, country }) {
  const response = new VoiceResponse();

  const audioCountry = await getAudioByCountry(country);

  if (msgKey) {
    response.play(
      {
        loop: 1,
      },
      new URL(audioCountry[msgKey], recordingsBaseUrl)
    );
  }

  response.hangup();
  return response.toString();
}
