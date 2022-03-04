import callStatus from '../../enums/callStatus';

// TODO remove this test it does nothing
describe('callStatus enum', () => {
    const { initiated, ringing, inProgress, completed, busy, noAnswer, canceled, failed } = callStatus;

    it('should have initiated value', () => {
        expect(initiated).toEqual('initiated');
    });

    it('should have ringing value', () => {
        expect(ringing).toEqual('ringing');
    });

    it('should have inProgress value', () => {
        expect(inProgress).toEqual('in-progress');
    });

    it('should have completed value', () => {
        expect(completed).toEqual('completed');
    });

    it('should have busy value', () => {
        expect(busy).toEqual('busy');
    });

    it('should have noAnswer value', () => {
        expect(noAnswer).toEqual('no-answer');
    });

    it('should have canceled value', () => {
        expect(canceled).toEqual('canceled');
    });

    it('should have failed value', () => {
        expect(failed).toEqual('failed');
    });
});
