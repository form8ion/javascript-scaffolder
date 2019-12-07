import inquirer from 'inquirer';
import any from '@travi/any';
import {assert} from 'chai';
import sinon from 'sinon';
import prompt from './prompt';

suite('project-type prompts', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(inquirer, 'prompt');
  });

  teardown(() => sandbox.restore());

  test('that the choice of application-type is presented', async () => {
    const chosenType = any.word();
    const projectType = any.word();
    const answers = {...any.simpleObject(), type: chosenType};
    const types = any.simpleObject();
    inquirer.prompt
      .withArgs([{
        name: 'type',
        type: 'list',
        message: `What type of ${projectType} is this?`,
        choices: [...Object.keys(types), new inquirer.Separator(), 'Other']
      }])
      .resolves(answers);

    assert.equal(await prompt({types, projectType}), chosenType);
  });

  test('that the prompt is skipped and `Other` is returned when no options ar provided ', async () => {
    assert.equal(await prompt({types: {}, projectType: any.word()}), 'Other');
  });
});
