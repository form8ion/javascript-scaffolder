import {prompt as promptWithInquirer, Separator} from 'inquirer';
import exec from '../../third-party-wrappers/exec-as-promised';
import {
  packageTypeIsApplication,
  scopePromptShouldBePresentedFactory,
  shouldBeScopedPromptShouldBePresented
} from './conditionals';
import npmConfFactory from '../../third-party-wrappers/npm-conf';
import {questionNames} from './question-names';
import {scope as validateScope} from './validators';

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

function authorQuestions({name, email, url}) {
  return [
    {
      name: questionNames.AUTHOR_NAME,
      message: 'What is the author\'s name?',
      default: name
    },
    {
      name: questionNames.AUTHOR_EMAIL,
      message: 'What is the author\'s email?',
      default: email
    },
    {
      name: questionNames.AUTHOR_URL,
      message: 'What is the author\'s website url?',
      default: url
    }
  ];
}

export async function prompt({npmAccount, author}, ciServices, hosts, visibility) {
  const npmConf = npmConfFactory();

  return promptWithInquirer([
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
    ...'Private' === visibility ? [] : [{
      name: questionNames.SHOULD_BE_SCOPED,
      message: 'Should this package be scoped?',
      type: 'confirm',
      when: shouldBeScopedPromptShouldBePresented,
      default: true
    }],
    {
      name: questionNames.SCOPE,
      message: 'What is the scope?',
      when: scopePromptShouldBePresentedFactory(visibility),
      validate: validateScope(visibility),
      default: npmAccount || (await exec('npm whoami')).trim()
    },
    ...authorQuestions(author || {
      name: npmConf.get('init.author.name'),
      email: npmConf.get('init.author.email'),
      url: npmConf.get('init.author.url')
    }),
    ...testingQuestions,
    {
      name: questionNames.CI_SERVICE,
      type: 'list',
      message: 'Which continuous integration service will be used?',
      choices: [...ciServices, new Separator(), 'Other']
    },
    {
      name: questionNames.HOST,
      type: 'list',
      message: 'Where will the application be hosted?',
      when: packageTypeIsApplication,
      choices: [...Object.keys(hosts), new Separator(), 'Other']
    }
  ]);
}
