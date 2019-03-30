import {assert} from 'chai';
import any from '@travi/any';
import scaffoldApplication from '../../../src/project-type/application';

suite('application project-type', () => {
  const projectRoot = any.string();

  test('that details specific to an application project-type are scaffolded', async () => {
    assert.deepEqual(
      await scaffoldApplication({projectRoot}),
      {
        scripts: {start: './lib/index.js'},
        dependencies: [],
        devDependencies: [],
        vcsIgnore: {files: [], directories: []}
      }
    );
  });
});
