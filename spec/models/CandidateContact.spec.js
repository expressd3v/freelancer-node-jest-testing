import CandidateContact from '../../models/CandidateContact';

describe('CandidateContact model', () => {
    const contactData = {
        candidateId: 50,
        phoneNumber: '+48500500500',
    };

    describe('schema', () => {
        it('should have candidateId property', () => {
            const { candidateId } = new CandidateContact(contactData);

            expect(candidateId).toEqual(contactData.candidateId);
        });

        it('should have phoneNumber property', () => {
            const { phoneNumber } = new CandidateContact(contactData);

            expect(phoneNumber).toEqual(contactData.phoneNumber);
        });
    });

    describe('methods', () => {
        describe('findByAccessCode', () => {
            it('should exist', () => {
                expect(CandidateContact.findByAccessCode).toBeDefined();
            });

            xit('should find a contact with specified access code', async (done) => {
                const contact = await CandidateContact.findByAccessCode('0000');

                expect(contact).not.toEqual(null);
                expect(contact.constructor).toEqual(CandidateContact);

                done();
            });
        });
    });
});
