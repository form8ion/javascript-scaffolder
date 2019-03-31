import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import scaffoldTypeChoice from '../../../src/project-type/choice-scaffolder';

suite('type choice scaffolder', () => {
  test('that chosen type is scaffolded', async () => {
    const chosenType = any.word();
    const options = any.simpleObject();
    const results = any.simpleObject();
    const chosenTypeScaffolder = sinon.stub();
    const typeScaffolders = {...any.simpleObject(), [chosenType]: chosenTypeScaffolder};
    chosenTypeScaffolder.withArgs(options).resolves(results);

    assert.equal(await scaffoldTypeChoice(typeScaffolders, chosenType, options), results);
  });

  test('that that choosing a type without a defined scaffolder does not result in an error', async () => {
    assert.deepEqual(
      await scaffoldTypeChoice(any.simpleObject(), any.string()),
      {scripts: {}, dependencies: [], devDependencies: [], vcsIgnore: {files: [], directories: []}}
    );
  });
});
