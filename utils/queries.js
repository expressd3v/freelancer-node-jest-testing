export const getCandidateByContact=`query getCandidate($contact: String){
    candidates(filter: { contact: $contact }){
        id
        name
        siteId
        studyId
        status {
            type
        }
    }
}`;


export const candidateQuery=`query getCandidate($id: ID!) {
    candidate(id: $id) {
      locale
      siteId
      studyId
    }
  }`;

export const phoneNumber=`query getPhoneNumber($countryCode: String!, $direction: phoneNumberDirection!){
    phoneNumber(countryCode: $countryCode, direction: $direction)
  }
  `;

  export const getSiteQuery=`
  query getSite($studyId: ID!, $siteId: ID!) {
    site(studyId: $studyId ,siteId: $siteId) {
      name
      inboundProxyNumber {
        id
        value
      }
    }
  }
  `;
