import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import scaffoldTypeChoice from './choice-scaffolder';

suite('type choice scaffolder', () => {
  test('that chosen type is scaffolded', async () => {
    const choice = any.word();
    const options = any.simpleObject();
    const results = any.simpleObject();
    const chosenScaffolder = sinon.stub();
    const choices = {...any.simpleObject(), [choice]: {scaffolder: chosenScaffolder}};
    chosenScaffolder.withArgs(options).resolves(results);

    assert.equal(await scaffoldTypeChoice(choices, choice, options), results);
  });

  test('that that choosing a type without a defined scaffolder does not result in an error', async () => {
    assert.deepEqual(
      await scaffoldTypeChoice(any.simpleObject(), any.string()),
      {scripts: {}, dependencies: [], devDependencies: [], vcsIgnore: {files: [], directories: []}}
    );
  });
});
