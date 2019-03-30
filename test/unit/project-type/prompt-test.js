import inquirer from 'inquirer';
import any from '@travi/any';
import {assert} from 'chai';
import sinon from 'sinon';
import prompt from '../../../src/project-type/prompt';

suite('project-type prompts', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(inquirer, 'prompt');
  });

  teardown(() => sandbox.restore());

  test('that the choice of application-type is presented', async () => {
    const answers = any.simpleObject();
    const types = any.simpleObject();
    inquirer.prompt
      .withArgs([{
        name: 'types',
        type: 'list',
        message: 'What type of application is this?',
        choices: [...Object.keys(types), new inquirer.Separator(), 'Other']
      }])
      .resolves(answers);

    assert.equal(await prompt({types}), answers);
  });
});
