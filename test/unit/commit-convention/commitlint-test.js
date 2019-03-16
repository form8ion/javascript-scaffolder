import any from '@travi/any';
import {assert} from 'chai';
import scaffoldCommitlint from '../../../src/commit-convention/commitlint';

suite('commitlint scaffolder', () => {
  test('that config is writted and dependencies are defined', async () => {
    const configPackageName = any.word();

    assert.deepEqual(
      await scaffoldCommitlint({config: {packageName: configPackageName}}),
      {devDependencies: [configPackageName]}
    );
  });
});
