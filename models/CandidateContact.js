import config from 'config';
import { getContactByCode } from '../utils/candidateService';

export default class CandidateContact {
  constructor({
    candidateId,
    phoneNumber,
  }) {
    this.candidateId = candidateId;
    this.phoneNumber = phoneNumber;
  }

  static async findByAccessCode(accessCode) {
    console.log('findByAccessCode', accessCode);
    const data = await getContactByCode(accessCode);

    if (!data) {
      return null;
    }

    const {
      candidateId,
      type,
      value,
    } = data;

    // accept only entries with "phone" kind
    if (!value || type.toLowerCase() !== 'phone') {
      return null;
    }

    const { NODE_ENV } = process.env;
    const { devNumber } = config.get('twilio');

    if (NODE_ENV !== 'production' && !devNumber) {
      console.info(`
        No development number recepient configured.
        Set "TWILIO_DEV_NUMBER" environment variable.
      `);
    }

    return new CandidateContact({
      candidateId,
      // in environments different than production,
      // always use dev number to prevent calling random people
      phoneNumber: (NODE_ENV === 'development') ? devNumber : value,
    });
  }
}
