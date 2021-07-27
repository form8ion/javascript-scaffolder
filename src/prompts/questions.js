import {Separator} from 'inquirer';
import {packageManagers, projectTypes} from '@form8ion/javascript-core';
import {prompt as promptWithInquirer} from '@form8ion/overridable-prompts';
import {questions as commonQuestions} from '@travi/language-scaffolder-prompts';
import {warn} from '@travi/cli-messages';
import execa from '../../third-party-wrappers/execa';
import npmConfFactory from '../../third-party-wrappers/npm-conf';
import buildDialectChoices from '../dialects/prompt-choices';
import {
  projectIsApplication,
  scopePromptShouldBePresentedFactory,
  shouldBeScopedPromptShouldBePresented,
  lintingPromptShouldBePresented
} from './conditionals';
import {questionNames} from './question-names';
import {scope as validateScope} from './validators';

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

export async function prompt(
  {npmAccount, author},
  ciServices,
  hosts,
  visibility,
  vcs,
  decisions,
  configs,
  pathWithinParent
) {
  const npmConf = npmConfFactory();

  let maybeLoggedInNpmUsername;
  try {
    maybeLoggedInNpmUsername = (await execa('npm', ['whoami'])).stdout;
  } catch (failedExecutionResult) {
    warn('No logged in user found with `npm whoami`. Login with `npm login` '
      + 'to use your npm account name as the package scope default.');
  }

  const answers = await promptWithInquirer([
    {
      name: questionNames.DIALECT,
      message: 'Which JavaScript dialect should this project follow?',
      type: 'list',
      choices: buildDialectChoices(configs),
      default: 'babel'
    },
    ...pathWithinParent ? [] : [{
      name: questionNames.NODE_VERSION_CATEGORY,
      message: 'What node.js version should be used?',
      type: 'list',
      choices: ['LTS', 'Latest'],
      default: 'LTS'
    }],
    {
      name: questionNames.PACKAGE_MANAGER,
      message: 'Which package manager will be used with this project?',
      type: 'list',
      choices: Object.values(packageManagers),
      default: packageManagers.NPM
    },
    {
      name: questionNames.PROJECT_TYPE,
      message: 'What type of JavaScript project is this?',
      type: 'list',
      choices: [...Object.values(projectTypes), new Separator(), 'Other'],
      default: projectTypes.PACKAGE
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
      default: npmAccount || maybeLoggedInNpmUsername
    },
    ...authorQuestions(author || {
      name: npmConf.get('init.author.name'),
      email: npmConf.get('init.author.email'),
      url: npmConf.get('init.author.url')
    }),
    ...commonQuestions(({vcs, ciServices, visibility, pathWithinParent})),
    {
      name: questionNames.CONFIGURE_LINTING,
      message: 'Will there be source code that should be linted?',
      type: 'confirm',
      when: lintingPromptShouldBePresented
    },
    {
      name: questionNames.HOST,
      type: 'list',
      message: 'Where will the application be hosted?',
      when: projectIsApplication,
      choices: [...Object.keys(hosts), new Separator(), 'Other']
    }
  ], decisions);

  return {
    ...answers,
    ...false !== answers[questionNames.CONFIGURE_LINTING] && {[questionNames.CONFIGURE_LINTING]: true}
  };
}
