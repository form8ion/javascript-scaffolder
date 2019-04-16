import fs from 'mz/fs';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as templatePath from '../../../src/template-path';
import scaffoldPackage from '../../../src/project-type/package';

suite('package project-type', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'copyFile');
    sandbox.stub(templatePath, 'default');
  });

  teardown(() => sandbox.restore());

  test('that details specific to a package project-type are scaffolded', async () => {
    const projectRoot = any.string();
    const pathToTemplate = any.string();
    templatePath.default.withArgs('rollup.config.js').returns(pathToTemplate);

    assert.deepEqual(
      await scaffoldPackage({projectRoot}),
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
        buildDirectory: './lib'
      }
    );
    assert.calledWith(fs.copyFile, pathToTemplate, `${projectRoot}/rollup.config.js`);
  });
});
