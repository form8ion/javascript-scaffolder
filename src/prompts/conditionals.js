import {questionNames as commonQuestionNames} from '@travi/language-scaffolder-prompts';
import {questionNames} from './question-names';

function projectIsPackage(answers) {
  return 'Package' === answers[questionNames.PROJECT_TYPE];
}

function packageShouldBeScoped(visibility, answers) {
  return 'Private' === visibility || answers[questionNames.SHOULD_BE_SCOPED];
}

export function shouldBeScopedPromptShouldBePresented(answers) {
  return projectIsPackage(answers);
}

export function scopePromptShouldBePresentedFactory(visibility) {
  return answers => projectIsPackage(answers) && packageShouldBeScoped(visibility, answers);
}

export function packageTypeIsApplication(answers) {
  return 'Application' === answers[questionNames.PROJECT_TYPE];
}

export function transpilationAndLintingPromptShouldBePresented({
  [commonQuestionNames.UNIT_TESTS]: unitTested,
  [commonQuestionNames.INTEGRATION_TESTS]: integrationTested
}) {
  return !unitTested && !integrationTested;
}
