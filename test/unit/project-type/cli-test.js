import {assert} from 'chai';
import any from '@travi/any';
import scaffoldCli from '../../../src/project-type/cli';

suite('cli project-type', () => {
  const projectRoot = any.string();

  test('that details specific to a cli project-type are scaffolded', async () => {
    const configs = any.simpleObject();

    assert.deepEqual(
      await scaffoldCli({projectRoot, configs}),
      {
        scripts: {
          clean: 'rimraf ./bin',
          prebuild: 'run-s clean',
          build: 'npm-run-all --print-label --parallel build:*',
          'build:js': 'rollup --config',
          watch: 'run-s \'build:js -- --watch\'',
          prepack: 'run-s build'
        },
        dependencies: ['update-notifier'],
        devDependencies: [
          'rimraf',
          'rollup',
          'rollup-plugin-auto-external',
          'rollup-plugin-executable',
          'rollup-plugin-json'
        ],
        vcsIgnore: {files: [], directories: ['/bin/']},
        buildDirectory: './bin'
      }
    );
  });
});
