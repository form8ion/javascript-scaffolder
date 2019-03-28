import {readFile} from 'mz/fs';
import {existsSync} from 'fs';
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
      'rollup.config.js': await readFile(resolve(__dirname, '../../../../', 'templates/rollup.config.js')),
      'canary-test.txt': await readFile(resolve(__dirname, '../../../../', 'templates/canary-test.txt')),
      'mocha.opts': await readFile(resolve(__dirname, '../../../../', 'templates/mocha.opts')),
      'mocha-setup.txt': await readFile(resolve(__dirname, '../../../../', 'templates/mocha-setup.txt')),
      'cucumber.txt': await readFile(resolve(__dirname, '../../../../', 'templates/cucumber.txt'))
    }
  });

  this.sinonSandbox = sinon.createSandbox();
});

After(function () {
  stubbedFs.restore();
  this.sinonSandbox.restore();
});

Given(/^the default answers are chosen$/, async function () {
  this.unitTestAnswer = ['\n'];
  this.integrationTestAnswer = ['\n'];
  this.transpilationLintAnswer = null;
});

When(/^the project is scaffolded$/, async function () {
  const visibility = any.fromList(['Public', 'Private']);

  bddStdIn(...[
    '\n',
    '\n',
    ...'Public' === visibility ? ['\n'] : [],
    '\n',
    '\n',
    '\n',
    '\n',
    ...this.unitTestAnswer,
    ...this.integrationTestAnswer,
    ...this.ciAnswer ? this.ciAnswer : [],
    ...this.transpilationLintAnswer ? this.transpilationLintAnswer : []
  ]);

  await scaffold({
    projectRoot: process.cwd(),
    projectName: any.string(),
    visibility,
    license: any.string(),
    vcs: this.vcs,
    configs: {
      eslint: {prefix: any.word(), packageName: any.word()},
      babelPreset: {name: any.word(), packageName: any.word()}
    }
  });
});

Then(/^the expected files are generated$/, async function () {
  const nvmRc = await readFile(`${process.cwd()}/.nvmrc`);

  assert.equal(nvmRc.toString(), this.latestLtsVersion);
  assert.isTrue(existsSync(`${process.cwd()}/.eslintrc.yml`));
  assert.isTrue(existsSync(`${process.cwd()}/.babelrc`));
});
