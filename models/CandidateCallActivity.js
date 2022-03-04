import { sendCandidateActivity } from '../utils/candidateService';

export default class CandidateCallActivity {
  constructor({ createdAt, action, candidateId, duration }) {
    this.action = action;
    this.candidateId = candidateId;
    this.duration = duration;
    this.createdAt = createdAt;
  }

  async send() {
    if (!this.candidateId) {
      return null;
    }

    try {
      const result = await sendCandidateActivity(this);
      return result;
    } catch (error) {
      console.log('error sending log', error);
      return {};
    }
  }
}
