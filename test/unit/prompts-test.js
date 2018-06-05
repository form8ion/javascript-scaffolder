import inquirer from 'inquirer';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as exec from '../../third-party-wrappers/exec-as-promised';
import * as npmConf from '../../third-party-wrappers/npm-conf';
import {scopePromptShouldBePresented, shouldBeScopedPromptShouldBePresented} from '../../src/prompt-condiftionals';
import {prompt, questionNames} from '../../src/prompts';

suite('prompts', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(inquirer, 'prompt');
    sandbox.stub(npmConf, 'default');
    sandbox.stub(exec, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the user is prompted for the necessary details', () => {
    const authorName = any.string();
    const authorEmail = any.string();
    const authorUrl = any.url();
    const npmUser = any.word();
    const get = sinon.stub();
    const ciServices = any.listOf(any.string);
    npmConf.default.returns({get});
    exec.default.withArgs('npm whoami').resolves(npmUser);
    get.withArgs('init.author.name').returns(authorName);
    get.withArgs('init.author.email').returns(authorEmail);
    get.withArgs('init.author.url').returns(authorUrl);
    inquirer.prompt.resolves();

    return prompt({}, ciServices).then(() => assert.calledWith(
      inquirer.prompt,
      [
        {
          name: questionNames.NODE_VERSION_CATEGORY,
          message: 'What node.js version should be used?',
          type: 'list',
          choices: ['LTS', 'Latest'],
          default: 'LTS'
        },
        {
          name: questionNames.PACKAGE_TYPE,
          message: 'What type of JavaScript project is this?',
          type: 'list',
          choices: ['Application', 'Package'],
          default: 'Package'
        },
        {
          name: questionNames.SHOULD_BE_SCOPED,
          message: 'Should this package be scoped?',
          type: 'confirm',
          when: shouldBeScopedPromptShouldBePresented,
          default: true
        },
        {
          name: questionNames.SCOPE,
          message: 'What is the scope?',
          when: scopePromptShouldBePresented,
          default: npmUser
        },
        {
          name: questionNames.AUTHOR_NAME,
          message: 'What is the author\'s name?',
          default: authorName
        },
        {
          name: questionNames.AUTHOR_EMAIL,
          message: 'What is the author\'s email?',
          default: authorEmail
        },
        {
          name: questionNames.AUTHOR_URL,
          message: 'What is the author\'s website url?',
          default: authorUrl
        },
        {
          name: questionNames.UNIT_TESTS,
          message: 'Will this project be unit tested?',
          type: 'confirm',
          default: true
        },
        {
          name: questionNames.INTEGRATION_TESTS,
          message: 'Will this project be integration tested?',
          type: 'confirm',
          default: true
        },
        {
          name: questionNames.CI_SERVICE,
          type: 'list',
          message: 'Which continuous integration service will be used?',
          choices: [...ciServices, 'Other']
        }
      ]
    ));
  });

  test('that defaults are overridden by the provided options', () => {
    const npmAccount = any.word();
    const author = {name: any.string(), email: any.string(), url: any.url()};
    const get = sinon.stub();
    npmConf.default.returns({get});

    return prompt({npmAccount, author}, []).then(() => {
      assert.calledWith(
        inquirer.prompt,
        sinon.match(value => 1 === value.filter((
          question => questionNames.SCOPE === question.name && npmAccount === question.default
        )).length)
      );
      assert.calledWith(
        inquirer.prompt,
        sinon.match(value => 1 === value.filter((
          question => questionNames.AUTHOR_NAME === question.name && author.name === question.default
        )).length)
      );
      assert.calledWith(
        inquirer.prompt,
        sinon.match(value => 1 === value.filter((
          question => questionNames.AUTHOR_EMAIL === question.name && author.email === question.default
        )).length)
      );
      assert.calledWith(
        inquirer.prompt,
        sinon.match(value => 1 === value.filter((
          question => questionNames.AUTHOR_URL === question.name && author.url === question.default
        )).length)
      );
    });
  });
});
