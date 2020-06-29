import {questionNames as languageScaffolderPromptsQuestionNames} from '@travi/language-scaffolder-prompts';
import {questionNames as coreQuestionNames} from '@form8ion/javascript-core';
import {questionNames as jsScaffolderQuestionNames} from './prompts/question-names';

export * from './scaffolder';
export const questionNames = {
  ...coreQuestionNames,
  ...languageScaffolderPromptsQuestionNames,
  ...jsScaffolderQuestionNames
};
