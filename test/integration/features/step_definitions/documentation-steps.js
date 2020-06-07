import {existsSync, promises as fs} from 'fs';
import {assert} from 'chai';
import camelcase from 'camelcase';

export async function assertThatDocumentationIsDefinedAppropriately(
  projectType,
  projectName,
  shouldBeTranspiledAndLinted
) {
  const pathToExampleFile = `${process.cwd()}/example.js`;
  const packageDetails = JSON.parse(await fs.readFile(`${process.cwd()}/package.json`));

  if ('package' === projectType && shouldBeTranspiledAndLinted) {
    const exampleContents = (await fs.readFile(pathToExampleFile)).toString();

    assert.equal(exampleContents, `// remark-usage-ignore-next
/* eslint-disable-next-line no-unused-vars */
import ${camelcase(projectName)} from './lib/index.cjs';
`);
    assert.isTrue(existsSync(`${process.cwd()}/src/index.js`));
    assert.isDefined(packageDetails.scripts['generate:md']);
    assert.isDefined(packageDetails.scripts['pregenerate:md']);
  } else if ('package' === projectType && !shouldBeTranspiledAndLinted) {
    const exampleContents = (await fs.readFile(pathToExampleFile)).toString();

    assert.equal(exampleContents, `import ${camelcase(projectName)} from '.';\n`);
    assert.isTrue(existsSync(`${process.cwd()}/index.js`));
    assert.isDefined(packageDetails.scripts['generate:md']);
    assert.isUndefined(packageDetails.scripts['pregenerate:md']);
  } else {
    assert.isFalse(existsSync(pathToExampleFile));
    assert.isUndefined(packageDetails.scripts['pregenerate:md']);
  }
}

export function assertThatDocumentationResultsAreReturnedCorrectly(
  projectType,
  scope,
  projectName,
  visibility,
  results
) {
  assert.equal(results.documentation.toc, 'Run `npm run generate:md` to generate a table of contents');
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
\`\`\`

### Example

run \`npm run generate:md\` to inject the usage example`
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
\`\`\`

### Example

run \`npm run generate:md\` to inject the usage example`
      );
    }
  }
}
