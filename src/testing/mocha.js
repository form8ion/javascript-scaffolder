import {copyFile} from 'mz/fs';
import mkdir from '../../third-party-wrappers/make-dir';
import determinePathToTemplateFile from '../template-path';

export default async function ({projectRoot}) {
  const createdUnitTestDirectory = await mkdir(`${projectRoot}/test/unit`);

  await Promise.all([
    copyFile(determinePathToTemplateFile('canary-test.txt'), `${createdUnitTestDirectory}/canary-test.js`),
    copyFile(determinePathToTemplateFile('mocha.opts'), `${createdUnitTestDirectory}/../mocha.opts`),
    copyFile(determinePathToTemplateFile('mocha-setup.txt'), `${createdUnitTestDirectory}/../mocha-setup.js`)
  ]);

  return {
    devDependencies: ['mocha', 'chai', 'sinon'],
    scripts: {'test:unit:base': 'DEBUG=any mocha --recursive test/unit'}
  };
}
