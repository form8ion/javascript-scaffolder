import {projectTypes} from '@form8ion/javascript-core';
import {questionNames as commonQuestionNames} from '@travi/language-scaffolder-prompts';
import {questionNames} from './question-names';

function projectIsPackage(answers) {
  return projectTypes.PACKAGE === answers[questionNames.PROJECT_TYPE];
}

function projectIsCLI(answers) {
  return projectTypes.CLI === answers[questionNames.PROJECT_TYPE];
}

export function projectIsApplication(answers) {
  return projectTypes.APPLICATION === answers[questionNames.PROJECT_TYPE];
}

function packageShouldBeScoped(visibility, answers) {
  return 'Private' === visibility || answers[questionNames.SHOULD_BE_SCOPED];
}

function willBePublishedToNpm(answers) {
  return projectIsPackage(answers) || projectIsCLI(answers);
}

export function shouldBeScopedPromptShouldBePresented(answers) {
  return willBePublishedToNpm(answers);
}

export function scopePromptShouldBePresentedFactory(visibility) {
  return answers => willBePublishedToNpm(answers) && packageShouldBeScoped(visibility, answers);
}

export function lintingPromptShouldBePresented({
  [commonQuestionNames.UNIT_TESTS]: unitTested,
  [commonQuestionNames.INTEGRATION_TESTS]: integrationTested
}) {
  return !unitTested && !integrationTested;
}
