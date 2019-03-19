import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import scaffoldCi from '../../src/ci';

suite('ci', () => {
  test('that the service scaffolder is passed the necessary data', () => {
    const options = any.simpleObject();
    const chosenService = any.word();
    const chosenServiceScaffolder = sinon.stub();
    const scaffolderResult = any.simpleObject();
    chosenServiceScaffolder.withArgs(options).resolves(scaffolderResult);
    const scaffolders = {...any.simpleObject(), [chosenService]: {scaffolder: chosenServiceScaffolder}};

    return assert.becomes(scaffoldCi(scaffolders, chosenService, options), scaffolderResult);
  });

  test('that choosing a scaffolder without a defined service does not result in an error', async () => {
    assert.deepEqual(
      scaffoldCi(any.simpleObject(), any.word(), any.simpleObject()),
      {devDependencies: [], scripts: {}, vcsIgnore: {files: [], directories: []}}
    );
  });
});
