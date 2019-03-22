import inquirer from 'inquirer';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as exec from '../../../third-party-wrappers/exec-as-promised';
import * as npmConf from '../../../third-party-wrappers/npm-conf';
import * as validators from '../../../src/prompts/validators';
import * as conditionals from '../../../src/prompts/conditionals';
import * as visibilityFilterForChoices from '../../../src/prompts/filter-by-visibility';
import {prompt} from '../../../src/prompts/questions';
import {questionNames} from '../../../src/prompts/question-names';

suite('prompts', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(inquirer, 'prompt');
    sandbox.stub(npmConf, 'default');
    sandbox.stub(exec, 'default');
    sandbox.stub(validators, 'scope');
    sandbox.stub(conditionals, 'scopePromptShouldBePresentedFactory');
    sandbox.stub(visibilityFilterForChoices, 'default');

    visibilityFilterForChoices.default.withArgs({}).returns({});
  });

  teardown(() => sandbox.restore());

  test('that the user is prompted for the necessary details', async () => {
    const authorName = any.string();
    const authorEmail = any.string();
    const authorUrl = any.url();
    const npmUser = any.word();
    const visibility = any.word();
    const get = sinon.stub();
    const ciServices = any.simpleObject();
    const filteredCiServiceNames = any.listOf(any.word);
    const filteredCiServices = any.objectWithKeys(filteredCiServiceNames);
    const hosts = any.simpleObject();
    const scopeValidator = () => undefined;
    const scopePromptShouldBePresented = () => undefined;
    const answers = any.simpleObject();
    npmConf.default.returns({get});
    exec.default.withArgs('npm whoami').resolves(`${npmUser}\n`);
    get.withArgs('init.author.name').returns(authorName);
    get.withArgs('init.author.email').returns(authorEmail);
    get.withArgs('init.author.url').returns(authorUrl);
    validators.scope.withArgs(visibility).returns(scopeValidator);
    conditionals.scopePromptShouldBePresentedFactory.withArgs(visibility).returns(scopePromptShouldBePresented);
    visibilityFilterForChoices.default.withArgs(ciServices, visibility).returns(filteredCiServices);
    inquirer.prompt
      .withArgs([
        {
          name: questionNames.NODE_VERSION_CATEGORY,
          message: 'What node.js version should be used?',
          type: 'list',
          choices: ['LTS', 'Latest'],
          default: 'LTS'
        },
        {
          name: questionNames.PROJECT_TYPE,
          message: 'What type of JavaScript project is this?',
          type: 'list',
          choices: ['Application', 'Package'],
          default: 'Package'
        },
        {
          name: questionNames.SHOULD_BE_SCOPED,
          message: 'Should this package be scoped?',
          type: 'confirm',
          when: conditionals.shouldBeScopedPromptShouldBePresented,
          default: true
        },
        {
          name: questionNames.SCOPE,
          message: 'What is the scope?',
          when: scopePromptShouldBePresented,
          validate: scopeValidator,
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
          choices: [...filteredCiServiceNames, new inquirer.Separator(), 'Other']
        },
        {
          name: questionNames.HOST,
          type: 'list',
          message: 'Where will the application be hosted?',
          when: conditionals.packageTypeIsApplication,
          choices: [...Object.keys(hosts), new inquirer.Separator(), 'Other']
        }
      ])
      .resolves(answers);

    assert.equal(await prompt({}, ciServices, hosts, visibility, any.simpleObject()), answers);
  });

  test('that the ci-service question is skipped when the project will not be versioned', async () => {
    const authorName = any.string();
    const authorEmail = any.string();
    const authorUrl = any.url();
    const npmUser = any.word();
    const visibility = any.word();
    const get = sinon.stub();
    const ciServices = any.simpleObject();
    const filteredCiServiceNames = any.listOf(any.word);
    const filteredCiServices = any.objectWithKeys(filteredCiServiceNames);
    const hosts = any.simpleObject();
    const scopeValidator = () => undefined;
    const scopePromptShouldBePresented = () => undefined;
    const answers = any.simpleObject();
    npmConf.default.returns({get});
    exec.default.withArgs('npm whoami').resolves(`${npmUser}\n`);
    get.withArgs('init.author.name').returns(authorName);
    get.withArgs('init.author.email').returns(authorEmail);
    get.withArgs('init.author.url').returns(authorUrl);
    validators.scope.withArgs(visibility).returns(scopeValidator);
    conditionals.scopePromptShouldBePresentedFactory.withArgs(visibility).returns(scopePromptShouldBePresented);
    visibilityFilterForChoices.default.withArgs(ciServices, visibility).returns(filteredCiServices);
    inquirer.prompt
      .withArgs([
        {
          name: questionNames.NODE_VERSION_CATEGORY,
          message: 'What node.js version should be used?',
          type: 'list',
          choices: ['LTS', 'Latest'],
          default: 'LTS'
        },
        {
          name: questionNames.PROJECT_TYPE,
          message: 'What type of JavaScript project is this?',
          type: 'list',
          choices: ['Application', 'Package'],
          default: 'Package'
        },
        {
          name: questionNames.SHOULD_BE_SCOPED,
          message: 'Should this package be scoped?',
          type: 'confirm',
          when: conditionals.shouldBeScopedPromptShouldBePresented,
          default: true
        },
        {
          name: questionNames.SCOPE,
          message: 'What is the scope?',
          when: scopePromptShouldBePresented,
          validate: scopeValidator,
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
          name: questionNames.HOST,
          type: 'list',
          message: 'Where will the application be hosted?',
          when: conditionals.packageTypeIsApplication,
          choices: [...Object.keys(hosts), new inquirer.Separator(), 'Other']
        }
      ])
      .resolves(answers);

    assert.equal(await prompt({}, ciServices, hosts, visibility, undefined), answers);
  });

  test('that defaults are overridden by the provided options', () => {
    const npmAccount = any.word();
    const author = {name: any.string(), email: any.string(), url: any.url()};
    const get = sinon.stub();
    npmConf.default.returns({get});

    return prompt({npmAccount, author}, {}, {}, null, any.simpleObject()).then(() => {
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

  test('that private packages are not asked about whether they should be scoped', async () => {
    exec.default.withArgs('npm whoami').resolves(any.word());
    npmConf.default.returns({get: () => undefined});

    await prompt({}, {}, {}, 'Private', any.simpleObject());

    assert.neverCalledWith(
      inquirer.prompt,
      sinon.match(value => 1 === value.filter(question => questionNames.SHOULD_BE_SCOPED === question.name).length)
    );
  });
});
