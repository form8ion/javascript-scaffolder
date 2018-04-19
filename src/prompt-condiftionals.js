import {questionNames} from './prompts';

export function shouldBeScopedPromptShouldBePresented(answers) {
  return 'Package' === answers[questionNames.PACKAGE_TYPE];
}

export function scopePromptShouldBePresented(answers) {
  return answers[questionNames.SHOULD_BE_SCOPED];
}
