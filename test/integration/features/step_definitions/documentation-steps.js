import {existsSync, promises as fs} from 'fs';
import {assert} from 'chai';

export async function assertThatDocumentationIsDefinedAppropriately(
  projectType,
  projectName,
  shouldBeTranspiledAndLinted
) {
  const pathToExampleFile = `${process.cwd()}/example.js`;

  if ('package' === projectType && shouldBeTranspiledAndLinted) {
    const exampleContents = (await fs.readFile(pathToExampleFile)).toString();

    assert.equal(exampleContents, `// remark-usage-ignore-next
/* eslint-disable-next-line no-unused-vars */
import ${projectName} from './src';
`);
  } else {
    assert.isFalse(existsSync(pathToExampleFile));
  }
}

export function assertThatDocumentationResultsAreReturnedCorrectly(
  projectType,
  scope,
  projectName,
  visibility,
  results
) {
  assert.equal(
    results.documentation.contributing,
    '### Dependencies\n\n```sh\n$ nvm install\n$ npm install\n```\n\n### Verification\n\n```sh\n$ npm test\n```'
  );

  if ('package' === projectType) {
    if ('Public' === visibility) {
      assert.equal(
        results.documentation.usage,
        `### Installation

\`\`\`sh
$ npm install @${scope}/${projectName}
\`\`\``
      );
    }

    if ('Private' === visibility) {
      assert.equal(
        results.documentation.usage,
        `### Installation

:warning: this is a private package, so you will need to use an npm token with
access to private packages under \`@${scope}\`

\`\`\`sh
$ npm install @${scope}/${projectName}
\`\`\``
      );
    }
  }
}
