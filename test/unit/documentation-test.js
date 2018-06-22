import {assert} from 'chai';
import any from '@travi/any';
import scaffoldDocumentation from '../../src/documentation';

suite('documentation', () => {
  suite('usage', () => {
    suite('apps', () => {
      test('that usage document is not provided (yet) for apps', () => {
        const documentation = scaffoldDocumentation({packageType: any.string()});

        assert.notProperty(documentation, 'usage');
      });
    });

    suite('packages', () => {
      test('that npm install instructions are provided for packages', () => {
        const packageName = any.string();

        const documentation = scaffoldDocumentation({packageType: 'Package', packageName});

        assert.equal(documentation.usage, `### Installation

\`\`\`sh
$ npm install ${packageName}
\`\`\``);
      });

      test('that an access note is provided for private packages', () => {
        const packageName = any.string();
        const scope = any.word();

        const documentation = scaffoldDocumentation({
          packageType: 'Package',
          packageName,
          visibility: 'Private',
          scope
        });

        assert.equal(documentation.usage, `### Installation

:warning: this is a private package, so you will need to use an npm token with
access to private packages under \`@${scope}\`

\`\`\`sh
$ npm install ${packageName}
\`\`\``);
      });
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
