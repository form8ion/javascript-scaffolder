import fs from 'mz/fs';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as templatePath from '../../../../src/template-path';
import * as defineBadges from '../../../../src/project-type/package/badges';
import scaffoldPackage from '../../../../src/project-type/package/scaffolder';

suite('package project-type', () => {
  let sandbox;
  const packageName = any.word();
  const badges = {consumer: any.simpleObject(), contribution: any.simpleObject(), status: any.simpleObject()};
  const visibility = any.word();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'copyFile');
    sandbox.stub(templatePath, 'default');
    sandbox.stub(defineBadges, 'default');

    defineBadges.default.withArgs(packageName, visibility).returns(badges);
  });

  teardown(() => sandbox.restore());

  test('that details specific to a package project-type are scaffolded', async () => {
    const projectRoot = any.string();
    const pathToTemplate = any.string();
    templatePath.default.withArgs('rollup.config.js').returns(pathToTemplate);

    assert.deepEqual(
      await scaffoldPackage({projectRoot, packageName, visibility}),
      {
        devDependencies: ['rimraf', 'rollup', 'rollup-plugin-auto-external'],
        scripts: {
          clean: 'rimraf ./lib',
          prebuild: 'run-s clean',
          build: 'npm-run-all --print-label --parallel build:*',
          'build:js': 'rollup --config',
          watch: 'run-s \'build:js -- --watch\'',
          prepack: 'run-s build'
        },
        vcsIgnore: {files: [], directories: ['/lib/']},
        buildDirectory: './lib',
        badges
      }
    );
    assert.calledWith(fs.copyFile, pathToTemplate, `${projectRoot}/rollup.config.js`);
  });

  test('that the runkit badge is included for public projects', async () => {
    const projectRoot = any.string();
    const pathToTemplate = any.string();
    templatePath.default.withArgs('rollup.config.js').returns(pathToTemplate);
    defineBadges.default.withArgs(packageName, 'Public').returns(badges);

    assert.deepEqual(
      (await scaffoldPackage({projectRoot, packageName, visibility: 'Public'})).badges.consumer.runkit,
      {
        img: `https://badge.runkitcdn.com/${packageName}.svg`,
        text: `Try ${packageName} on RunKit`,
        link: `https://npm.runkit.com/${packageName}`
      }
    );
    assert.calledWith(fs.copyFile, pathToTemplate, `${projectRoot}/rollup.config.js`);
  });

  test('that build details are not included when the project will not be transpiled', async () => {
    const projectRoot = any.string();
    const pathToTemplate = any.string();
    templatePath.default.withArgs('rollup.config.js').returns(pathToTemplate);

    assert.deepEqual(
      await scaffoldPackage({projectRoot, transpileLint: false, packageName, visibility}),
      {
        devDependencies: [],
        scripts: {},
        vcsIgnore: {files: [], directories: []},
        badges
      }
    );
    assert.neverCalledWith(fs.copyFile, pathToTemplate, `${projectRoot}/rollup.config.js`);
  });
});
