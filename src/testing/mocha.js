import {copyFile, writeFile} from 'mz/fs';
import mkdir from '../../third-party-wrappers/make-dir';
import determinePathToTemplateFile from '../template-path';

export default async function ({projectRoot}) {
  const [createdTestDirectory, createdSrcDirectory] = await Promise.all([
    mkdir(`${projectRoot}/test`),
    mkdir(`${projectRoot}/src`)
  ]);

  await Promise.all([
    copyFile(determinePathToTemplateFile('canary-test.txt'), `${createdSrcDirectory}/canary-test.js`),
    writeFile(
      `${projectRoot}/.mocharc.json`,
      JSON.stringify({ui: 'tdd', require: ['@babel/register', './test/mocha-setup.js']})
    ),
    copyFile(determinePathToTemplateFile('mocha-setup.txt'), `${createdTestDirectory}/mocha-setup.js`)
  ]);

  return {
    devDependencies: ['mocha', 'chai', 'sinon'],
    scripts: {'test:unit:base': "DEBUG=any mocha 'src/**/*-test.js'"},
    eslintConfigs: ['mocha'],
    nextSteps: [{summary: 'Remove the canary test for mocha once more valuable tests exist'}]
  };
}
