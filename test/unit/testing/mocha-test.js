import fs from 'mz/fs';
import path from 'path';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as mkdir from '../../../third-party-wrappers/make-dir';
import scaffoldMocha from '../../../src/testing/mocha';

suite('mocha scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(mkdir, 'default');
    sandbox.stub(fs, 'copyFile');
  });

  teardown(() => sandbox.restore());

  test('that mocha is scaffolded', async () => {
    const pathToCreatedDirectory = any.string();
    mkdir.default.withArgs(`${projectRoot}/test/unit`).resolves(pathToCreatedDirectory);

    assert.deepEqual(
      await scaffoldMocha({projectRoot}),
      {
        devDependencies: ['mocha', 'chai', 'sinon'],
        scripts: {
          'test:unit': 'nyc run-s test:unit:base',
          'test:unit:base': 'DEBUG=any mocha --recursive test/unit'
        }
      }
    );
    assert.calledWith(
      fs.copyFile,
      path.resolve(__dirname, '../../../', 'templates', 'canary-test.txt'),
      `${pathToCreatedDirectory}/canary-test.js`
    );
    assert.calledWith(
      fs.copyFile,
      path.resolve(__dirname, '../../../', 'templates', 'mocha.opts'),
      `${pathToCreatedDirectory}/../mocha.opts`
    );
    assert.calledWith(
      fs.copyFile,
      path.resolve(__dirname, '../../../', 'templates', 'mocha-setup.txt'),
      `${pathToCreatedDirectory}/../mocha-setup.js`
    );
  });
});
