import {copyFile, writeFile} from 'mz/fs';
import mkdir from '../../third-party-wrappers/make-dir';
import determinePathToTemplateFile from '../template-path';

export default async function ({projectRoot}) {
  const createdUnitTestDirectory = await mkdir(`${projectRoot}/test/unit`);

  await Promise.all([
    copyFile(determinePathToTemplateFile('canary-test.txt'), `${createdUnitTestDirectory}/canary-test.js`),
    writeFile(
      `${projectRoot}/.mocharc.json`,
      JSON.stringify({ui: 'tdd', require: ['@babel/register', './test/mocha-setup.js'], recursive: true})
    ),
    copyFile(determinePathToTemplateFile('mocha-setup.txt'), `${createdUnitTestDirectory}/../mocha-setup.js`)
  ]);

  return {
    devDependencies: ['mocha', 'chai', 'sinon'],
    scripts: {'test:unit:base': 'DEBUG=any mocha --recursive test/unit'},
    eslintConfigs: ['mocha']
  };
}
