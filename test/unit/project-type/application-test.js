import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as applicationChooser from '../../../src/project-type/prompt';
import scaffoldApplication from '../../../src/project-type/application';

suite('application project-type', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(applicationChooser, 'default');
  });

  teardown(() => sandbox.restore());

  test('that details specific to an application project-type are scaffolded', async () => {
    const applicationTypes = any.simpleObject();

    assert.deepEqual(
      await scaffoldApplication({projectRoot, applicationTypes}),
      {
        scripts: {start: './lib/index.js'},
        dependencies: [],
        devDependencies: [],
        vcsIgnore: {files: [], directories: []}
      }
    );
    assert.calledWith(applicationChooser.default, {types: applicationTypes});
  });
});
