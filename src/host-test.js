import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import scaffoldHost from './host';

suite('host', () => {
  test('that the host scaffolder is passed the necessary data', async () => {
    const options = any.simpleObject();
    const chosenHost = any.word();
    const chosenHostScaffolder = sinon.stub();
    const scaffolderResult = any.simpleObject();
    chosenHostScaffolder.withArgs(options).resolves(scaffolderResult);
    const scaffolders = {...any.simpleObject(), [chosenHost]: {scaffolder: chosenHostScaffolder}};

    assert.equal(await scaffoldHost(scaffolders, chosenHost, options), scaffolderResult);
  });

  test('that choosing a scaffolder without a defined host does not result in an error', async () => {
    assert.deepEqual(
      scaffoldHost(any.simpleObject(), any.word(), any.simpleObject()),
      {devDependencies: [], vcsIgnore: {directories: [], files: []}, scripts: {}}
    );
  });
});
