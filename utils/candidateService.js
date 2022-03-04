import config from 'config';
import { GraphQLClient } from 'graphql-request';

const { endpoint } = config.get('candidateService');
const client = new GraphQLClient(endpoint);

export async function getContactByCode(code) {
  const { contactByCode } = await client.request(`
    query ($code: String!) {
      contactByCode(code: $code) {
        id
        candidateId
        value
        type
      }
    }`, {
      code,
    }
  );

  return contactByCode;
}

export async function sendCandidateActivity({
  candidateId,
  action,
  createdAt,
  duration,
  additionalPayload,
}) {
  if (action) {
    // so we dont break activity log
    if (action.toLowerCase() === 'initiated') {
      // eslint-disable-next-line no-param-reassign
      action = 'outbound_start';
    }
    if (action.toLowerCase() === 'completed') {
      // eslint-disable-next-line no-param-reassign
      action = 'outbound_end';
    }
  }

  const activity = {
    type: 'PHONE',
    candidateId,
    action,
    createdAt,
    additionalPayload,
  };

  if (duration) {
    activity.newValue = duration;
  }

  const result = await client.request(`
      mutation ($activity: ActivityInput!) {
          addCandidateActivity(activity: $activity) {
              id
          }
      }
  `, {
      activity,
  });

  return result;
}
