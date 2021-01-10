import any from '@travi/any';
import {assert} from 'chai';
import sinon from 'sinon';
import * as documentationCommandBuilder from '../../documentation/generation-command';
import scaffoldDocumentation from './documentation';

suite('package documentation', () => {
  let sandbox;
  const packageManager = any.word();
  const documentationGenerationCommand = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(documentationCommandBuilder, 'default');

    documentationCommandBuilder.default.withArgs(packageManager).returns(documentationGenerationCommand);
  });

  teardown(() => sandbox.restore());

  test('that npm install instructions are provided for packages', () => {
    const packageName = any.string();

    const documentation = scaffoldDocumentation({packageName, packageManager});

    assert.equal(documentation.usage, `### Installation

\`\`\`sh
$ npm install ${packageName}
\`\`\`

### Example

run \`${documentationGenerationCommand}\` to inject the usage example`);
  });

  test('that an access note is provided for private packages', () => {
    const packageName = any.string();
    const scope = any.word();

    const documentation = scaffoldDocumentation({packageName, packageManager, visibility: 'Private', scope});

    assert.equal(documentation.usage, `### Installation

:warning: this is a private package, so you will need to use an npm token with
access to private packages under \`@${scope}\`

\`\`\`sh
$ npm install ${packageName}
\`\`\`

### Example

run \`${documentationGenerationCommand}\` to inject the usage example`);
  });
});
