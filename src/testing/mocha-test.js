import {promises as fsPromises} from 'fs';
import path from 'path';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as mkdir from '../../third-party-wrappers/make-dir';
import scaffoldMocha from './mocha';

suite('mocha scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(mkdir, 'default');
    sandbox.stub(fsPromises, 'copyFile');
    sandbox.stub(fsPromises, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that mocha is scaffolded', async () => {
    const pathToCreatedTestDirectory = any.string();
    const pathToCreatedSrcDirectory = any.string();
    mkdir.default.withArgs(`${projectRoot}/src`).resolves(pathToCreatedSrcDirectory);
    mkdir.default.withArgs(`${projectRoot}/test`).resolves(pathToCreatedTestDirectory);

    assert.deepEqual(
      await scaffoldMocha({projectRoot}),
      {
        devDependencies: ['mocha', 'chai', 'sinon'],
        scripts: {'test:unit:base': "DEBUG=any mocha 'src/**/*-test.js'"},
        eslintConfigs: ['mocha'],
        nextSteps: [{summary: 'Remove the canary test for mocha once more valuable tests exist'}]
      }
    );
    assert.calledWith(
      fsPromises.copyFile,
      path.resolve(__dirname, '../../', 'templates', 'canary-test.txt'),
      `${pathToCreatedSrcDirectory}/canary-test.js`
    );
    assert.calledWith(
      fsPromises.writeFile,
      `${projectRoot}/.mocharc.json`,
      JSON.stringify({ui: 'tdd', require: ['@babel/register', './test/mocha-setup.js']})
    );
    assert.calledWith(
      fsPromises.copyFile,
      path.resolve(__dirname, '../../', 'templates', 'mocha-setup.txt'),
      `${pathToCreatedTestDirectory}/mocha-setup.js`
    );
  });
});
