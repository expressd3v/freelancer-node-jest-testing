import Jasmine from 'jasmine';
import JasmineConsoleReporter from 'jasmine-console-reporter';

import mockGraphQL from './mockGraphQL';

(async () => {
    await mockGraphQL();

    const jasmine = new Jasmine();
    const reporter = new JasmineConsoleReporter();

    jasmine.env.clearReporters();
    jasmine.addReporter(reporter);
    jasmine.loadConfigFile('spec/jasmine.json');
    jasmine.execute();
})();
