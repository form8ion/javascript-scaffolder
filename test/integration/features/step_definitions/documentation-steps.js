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
