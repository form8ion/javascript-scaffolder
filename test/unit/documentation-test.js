import {assert} from 'chai';
import any from '@travi/any';
import scaffoldDocumentation from '../../src/documentation';

suite('documentation', () => {
  suite('usage', () => {
    test('that usage document is not provided (yet) for apps', () => {
      const documentation = scaffoldDocumentation({packageType: any.string()});

      assert.notProperty(documentation, 'usage');
    });

    test('that npm install instructions are provided for packages', () => {
      const packageName = any.string();

      const documentation = scaffoldDocumentation({packageType: 'Package', packageName});

      assert.equal(documentation.usage, `### Installation

\`\`\`sh
$ npm install ${packageName}
\`\`\``);
    });
  });

  suite('contribution', () => {
    test('that contribution details are provided', () => {
      const documentation = scaffoldDocumentation({});

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
