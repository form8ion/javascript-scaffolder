import {readFile} from 'mz/fs';
import {resolve} from 'path';
import {After, Before, Given, setWorldConstructor, Then, When} from 'cucumber';
import stubbedFs from 'mock-fs';
import any from '@travi/any';
import bddStdIn from 'bdd-stdin';
import sinon from 'sinon';
import {assert} from 'chai';
import {World} from '../support/world';
import {scaffold} from '../../../../src';

setWorldConstructor(World);

Before(async function () {
  // work around for overly aggressive mock-fs, see:
  // https://github.com/tschaub/mock-fs/issues/213#issuecomment-347002795
  require('mock-stdin'); // eslint-disable-line import/no-extraneous-dependencies

  stubbedFs({
    templates: {
      'huskyrc.json': await readFile(resolve(__dirname, '../../../../', 'templates/huskyrc.json')),
      'rollup.config.js': await readFile(resolve(__dirname, '../../../../', 'templates/rollup.config.js')),
      'nycrc.json': await readFile(resolve(__dirname, '../../../../', 'templates/nycrc.json')),
      'canary-test.txt': await readFile(resolve(__dirname, '../../../../', 'templates/canary-test.txt')),
      'mocha.opts': await readFile(resolve(__dirname, '../../../../', 'templates/mocha.opts')),
      'mocha-setup.txt': await readFile(resolve(__dirname, '../../../../', 'templates/mocha-setup.txt'))
    }
  });

  this.sinonSandbox = sinon.createSandbox();
});

After(() => stubbedFs.restore());

Given(/^the default answers are chosen$/, async function () {
  bddStdIn(
    '\n',
    '\n',
    '\n',
    '\n',
    '\n',
    '\n',
    '\n',
    '\n',
    '\n',
    '\n',
    '\n'
  );
});

When(/^the project is scaffolded$/, async function () {
  await scaffold({
    projectRoot: process.cwd(),
    projectName: any.string(),
    visibility: any.fromList(['Public', 'Private']),
    license: any.string(),
    vcs: {host: any.word(), owner: any.word(), name: any.word()}
  });
});

Then(/^the expected files are generated$/, async function () {
  const nvmRc = await readFile(`${process.cwd()}/.nvmrc`);

  assert.equal(nvmRc.toString(), this.latestLtsVersion);
});
