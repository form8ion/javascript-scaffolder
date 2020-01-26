import inquirer from 'inquirer';
import * as prompts from '@form8ion/overridable-prompts';
import any from '@travi/any';
import {assert} from 'chai';
import sinon from 'sinon';
import {questionNames} from '../prompts/question-names';
import prompt from './prompt';

suite('project-type prompts', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(prompts, 'prompt');
  });

  teardown(() => sandbox.restore());

  test('that the choice of application-type is presented', async () => {
    const chosenType = any.word();
    const projectType = any.word();
    const decisions = any.simpleObject();
    const answers = {...any.simpleObject(), type: chosenType};
    const types = any.simpleObject();
    prompts.prompt
      .withArgs([{
        name: questionNames.PROJECT_TYPE_CHOICE,
        type: 'list',
        message: `What type of ${projectType} is this?`,
        choices: [...Object.keys(types), new inquirer.Separator(), 'Other']
      }], decisions)
      .resolves(answers);

    assert.equal(await prompt({types, projectType, decisions}), chosenType);
  });

  test('that the prompt is skipped and `Other` is returned when no options ar provided ', async () => {
    assert.equal(await prompt({types: {}, projectType: any.word()}), 'Other');
  });
});
