import {assert} from 'chai';
import scaffoldDocumentation from '../../src/documentation';

suite('documentation', () => {
  suite('contribution', () => {
    test('that contribution details are provided', () => {
      const documentation = scaffoldDocumentation();

      assert.equal(
        documentation.contributing,
        `### Dependencies

\`\`\`sh
$ nvm install
$ npm install
\`\`\`

### Verification

\`\`\`sh
$ npm test
\`\`\``
      );
    });
  });
});
