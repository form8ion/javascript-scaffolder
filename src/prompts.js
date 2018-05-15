import {prompt as promptWithInquirer} from 'inquirer';
import exec from '../third-party-wrappers/exec-as-promised';
import {scopePromptShouldBePresented, shouldBeScopedPromptShouldBePresented} from './prompt-condiftionals';
import npmConfFactory from '../third-party-wrappers/npm-conf';

export const questionNames = {
  NODE_VERSION_CATEGORY: 'nodeVersionCategory',
  PACKAGE_TYPE: 'packageType',
  SHOULD_BE_SCOPED: 'shouldBeScoped',
  SCOPE: 'scope',
  UNIT_TESTS: 'unitTests',
  INTEGRATION_TESTS: 'integrationTests',
  AUTHOR_NAME: 'authorName',
  AUTHOR_EMAIL: 'authorEmail',
  AUTHOR_URL: 'authorUrl'
};

const testingQuestions = [
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
  }
];

function authorQuestions(npmConf) {
  return [
    {
      name: questionNames.AUTHOR_NAME,
      message: 'What is the author\'s name?',
      default: npmConf.get('init.author.name')
    },
    {
      name: questionNames.AUTHOR_EMAIL,
      message: 'What is the author\'s email?',
      default: npmConf.get('init.author.email')
    },
    {
      name: questionNames.AUTHOR_URL,
      message: 'What is the author\'s website url?',
      default: npmConf.get('init.author.url')
    }
  ];
}

export async function prompt({npmAccount}) {
  const npmConf = npmConfFactory();

  return promptWithInquirer([
    {
      name: questionNames.NODE_VERSION_CATEGORY,
      message: 'What node.js version should be used?',
      type: 'list',
      choices: ['LTS', 'Latest'],
      default: 'Latest'
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
      default: npmAccount || await exec('npm whoami')
    },
    ...authorQuestions(npmConf),
    ...testingQuestions
  ]);
}
