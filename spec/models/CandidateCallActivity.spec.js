import CandidateCallActivity from '../../models/CandidateCallActivity';

describe('CandidateCallActivity model', () => {
    const candidateCallActivityData = {
        action: 'outbound_end',
        candidateId: '1',
        createdAt: new Date().toISOString(),
    };

    describe('schema', () => {
        it('should have action property', () => {
            const { action } = new CandidateCallActivity(candidateCallActivityData);

            expect(action).toEqual(candidateCallActivityData.action);
        });

        it('should have candidateId property', () => {
            const { candidateId } = new CandidateCallActivity(candidateCallActivityData);

            expect(candidateId).toEqual(candidateCallActivityData.candidateId);
        });

        it('should have duration property', () => {
            const { duration } = new CandidateCallActivity(candidateCallActivityData);

            expect(duration).toEqual(candidateCallActivityData.duration);
        });

        it('should have createdAt property', () => {
            const { createdAt } = new CandidateCallActivity(candidateCallActivityData);

            expect(createdAt).toEqual(candidateCallActivityData.createdAt);
        });
    });

    describe('methods', () => {
        describe('send', () => {
            it('should exist', () => {
                const candidateCallActivity = new CandidateCallActivity(candidateCallActivityData);

                expect(candidateCallActivity.send).toBeDefined();
            });

        });
    });
});
