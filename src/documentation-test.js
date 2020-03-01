import {assert} from 'chai';
import any from '@travi/any';
import scaffoldDocumentation from './documentation';

suite('documentation', () => {
  const contributionDocumentation = `### Dependencies

\`\`\`sh
$ nvm install
$ npm install
\`\`\`

### Verification

\`\`\`sh
$ npm test
\`\`\``;

  test('that project-type documentation and contribution details are provided', () => {
    const projectTypeResults = {documentation: any.simpleObject()};

    assert.deepEqual(
      scaffoldDocumentation({projectTypeResults}),
      {
        toc: '',
        ...projectTypeResults.documentation,
        contributing: contributionDocumentation
      }
    );
  });

  test('that project-type documentation is not included when not provided', () => {
    const projectTypeResults = {documentation: undefined};

    assert.deepEqual(
      scaffoldDocumentation({projectTypeResults}),
      {
        toc: '',
        contributing: contributionDocumentation
      }
    );
  });
});
