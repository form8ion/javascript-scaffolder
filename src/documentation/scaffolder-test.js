import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as documentationCommandBuilder from './generation-command';
import scaffoldDocumentation from './scaffolder';

suite('documentation', () => {
  let sandbox;
  const packageManager = any.word();
  const documentationGenerationCommand = any.string();
  const tocMessage = `Run \`${documentationGenerationCommand}\` to generate a table of contents`;
  const contributionDocumentation = `### Dependencies

\`\`\`sh
$ nvm install
$ ${packageManager} install
\`\`\`

### Verification

\`\`\`sh
$ ${packageManager} test
\`\`\``;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(documentationCommandBuilder, 'default');

    documentationCommandBuilder.default.withArgs(packageManager).returns(documentationGenerationCommand);
  });

  teardown(() => sandbox.restore());

  test('that project-type documentation and contribution details are provided', () => {
    const projectTypeResults = {documentation: any.simpleObject()};

    assert.deepEqual(
      scaffoldDocumentation({projectTypeResults, packageManager}),
      {
        toc: tocMessage,
        ...projectTypeResults.documentation,
        contributing: contributionDocumentation
      }
    );
  });

  test('that project-type documentation is not included when not provided', () => {
    const projectTypeResults = {documentation: undefined};

    assert.deepEqual(
      scaffoldDocumentation({projectTypeResults, packageManager}),
      {
        toc: tocMessage,
        contributing: contributionDocumentation
      }
    );
  });
});
