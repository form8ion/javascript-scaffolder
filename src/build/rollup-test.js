import {promises as fs} from 'fs';
import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import * as templatePath from '../template-path';
import {scaffold} from './rollup';

suite('rollup', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'copyFile');
    sandbox.stub(templatePath, 'default');
  });

  teardown(() => sandbox.restore());

  test('that rollup is configured', async () => {
    const projectRoot = any.string();
    const pathToRollupTemplate = any.string();
    templatePath.default.withArgs('rollup.config.js').returns(pathToRollupTemplate);

    const {devDependencies, scripts} = await scaffold({projectRoot});

    assert.equal(scripts['build:js'], 'rollup --config');
    assert.equal(scripts.watch, 'run-s \'build:js -- --watch\'');
    assert.deepEqual(devDependencies, ['rollup', 'rollup-plugin-auto-external']);
    assert.calledWith(fs.copyFile, pathToRollupTemplate, `${projectRoot}/rollup.config.js`);
  });
});
