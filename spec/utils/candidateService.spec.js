import { getContactByCode, sendCandidateActivity } from '../../utils/candidateService';

describe('candidateService', () => {
    xdescribe('getContactByCode', () => {
        it('should find a contact with specified access code', async (done) => {
            const contact = await getContactByCode('0000');

            expect(contact).not.toEqual(null);
            expect(contact.candidateId).toEqual('1');

            done();
        });

        it('should not find contact with bad accessCode', async (done) => {
            const candidate = await getContactByCode('12');

            expect(candidate).toEqual(null);

            done();
        });
    });
});
