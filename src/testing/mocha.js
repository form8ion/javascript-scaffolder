import {copyFile} from 'mz/fs';
import {resolve} from 'path';
import mkdir from '../../third-party-wrappers/make-dir';

export default async function ({projectRoot}) {
  const createdUnitTestDirectory = await mkdir(`${projectRoot}/test/unit`);

  await Promise.all([
    copyFile(resolve(__dirname, '../..', 'templates', 'canary-test.txt'), `${createdUnitTestDirectory}/canary-test.js`),
    copyFile(resolve(__dirname, '../..', 'templates', 'mocha.opts'), `${createdUnitTestDirectory}/../mocha.opts`),
    copyFile(
      resolve(__dirname, '../..', 'templates', 'mocha-setup.txt'),
      `${createdUnitTestDirectory}/../mocha-setup.js`
    )
  ]);

  return {devDependencies: ['mocha', 'chai', 'sinon']};
}
