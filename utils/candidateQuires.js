import config from 'config';
import { GraphQLClient } from 'graphql-request';
import { getCandidateByContact, candidateQuery, phoneNumber, getSiteQuery } from './queries';
const { endpoint } = config.get('candidateService');
const { studyServiceEndpoint }=config.get('studyService');

const candidateService = new GraphQLClient(endpoint);
const studyService= new GraphQLClient(studyServiceEndpoint);

export function checkIfCandidate(contact) {
    return candidateService.request(getCandidateByContact, { contact });
}

export function getCandidate(id) {
    return candidateService.request(candidateQuery, { id });
}

export function getPhoneNumber({ countryCode, direction }) {
    return studyService.request(phoneNumber, { countryCode, direction });
}

export function getSite({ studyId, siteId }) {
    return studyService.request(getSiteQuery, { studyId, siteId });
}
