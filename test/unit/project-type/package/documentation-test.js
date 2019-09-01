import any from '@travi/any';
import {assert} from 'chai';
import scaffoldDocumentation from '../../../../src/project-type/package/documentation';

suite('package documentation', () => {
  test('that npm install instructions are provided for packages', () => {
    const packageName = any.string();

    const documentation = scaffoldDocumentation({packageName});

    assert.equal(documentation.usage, `### Installation

\`\`\`sh
$ npm install ${packageName}
\`\`\``);
  });

  test('that an access note is provided for private packages', () => {
    const packageName = any.string();
    const scope = any.word();

    const documentation = scaffoldDocumentation({packageName, visibility: 'Private', scope});

    assert.equal(documentation.usage, `### Installation

:warning: this is a private package, so you will need to use an npm token with
access to private packages under \`@${scope}\`

\`\`\`sh
$ npm install ${packageName}
\`\`\``);
  });
});
